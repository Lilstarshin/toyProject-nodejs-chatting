// @ts-check
(() => {
  const socket = new WebSocket(`ws://${window.location.host}/ws`);
  const fomrEl = document.getElementById('form');
  /** @type{HTMLInputElement | null} */
  // @ts-ignore
  const inputEl = document.getElementById('input');
  const chatsEl = document.getElementById('chats');
  if (!fomrEl || !inputEl || !chatsEl) {
    throw new Error('Init failed!');
  }
  /**
   * @typedef Chat
   * @property {string} type
   * @property {string} nickname
   * @property {string} message
   */

  /** @type {Chat[]} */
  const chats = [];

  const abjectives = ['멋진', '훌륭한', '친절한', '새침한'];
  const animals = ['물범', '사자', '사슴', '돌고래', '독수리'];
  /**
   * @param {string[]} arr
   * @returns {string}
   */
  function pickRandom(arr) {
    const randomIdx = Math.floor(Math.random() * arr.length);
    const result = arr[randomIdx];
    if (!result) {
      throw new Error('arr length is 0');
    }
    return result;
  }
  const randomNickname = `${pickRandom(abjectives)}${pickRandom(animals)}`;

  fomrEl.addEventListener('submit', (e) => {
    e.preventDefault();
    socket.send(
      JSON.stringify({
        nickname: randomNickname,
        message: inputEl.value,
      })
    );
    inputEl.value = '';
  });

  const drawChats = () => {
    chatsEl.innerHTML = '';
    chats.forEach(({ message, nickname }) => {
      const div = document.createElement('div');
      div.innerHTML = `${nickname}: ${message}`;
      chatsEl.appendChild(div);
    });
  };
  socket.addEventListener('open', () => {});
  socket.addEventListener('message', (e) => {
    const { type, payload } = JSON.parse(e.data);
    if (type === 'sync') {
      const { chats: syncedChats } = payload;
      chats.push(...syncedChats);
    } else if (type === 'chat') {
      const chat = payload;
      chats.push(chat);
    }

    drawChats();
    chats.push();
  });
})();

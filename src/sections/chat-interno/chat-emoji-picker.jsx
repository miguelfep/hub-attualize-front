import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';

// ----------------------------------------------------------------------
// Seletor de emoji do chat interno: grade de emojis unicode por categoria,
// sem lib externa (o navegador renderiza nativamente). Usado no input de
// mensagem; a lista curta de "frequentes" cobre o uso do dia a dia.
// ----------------------------------------------------------------------

const CATEGORIAS = [
  {
    rotulo: 'Carinhas',
    icone: '😀',
    emojis:
      '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😋 😜 🤪 🤗 🤔 🤨 😐 😑 😶 🙄 😏 😴 😪 🤤 😷 🤒 🤕 🥵 🥶 😵 🤯 🥳 😎 🤓 🧐 😕 😟 🙁 😮 😯 😲 😳 🥺 😢 😭 😤 😠 😡 🤬 😱 😨 😰 😥 😓 🤫 🤭 🫡 🤝 😬 💀',
  },
  {
    rotulo: 'Gestos',
    icone: '👍',
    emojis:
      '👍 👎 👊 ✊ 🤛 🤜 👏 🙌 👐 🤲 🤞 ✌️ 🤟 🤘 👌 🤌 🤏 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐️ 🖖 👋 🤙 💪 🙏 ✍️ 💅 🤳 💃 🕺 🫶 ❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💯 💢 💥 💫 💦 💨 🕳️ 💬 👀 🗯️ 💭 💤',
  },
  {
    rotulo: 'Trabalho',
    icone: '💼',
    emojis:
      '💼 📁 📂 🗂️ 📅 📆 🗒️ 🗓️ 📇 📈 📉 📊 📋 📌 📍 📎 🖇️ 📏 📐 ✂️ 🖊️ 🖋️ ✒️ 📝 ✏️ 🔍 🔎 🔐 🔒 🔓 🔏 💻 🖥️ 🖨️ ⌨️ 🖱️ 💾 💿 📀 ☎️ 📞 📟 📠 📧 📨 📩 📤 📥 📦 📫 📮 🗳️ 💰 💴 💵 💶 💷 💸 💳 🧾 ⏰ ⏱️ ⌛ ⏳ ✅ ❌ ⚠️ 🚀',
  },
  {
    rotulo: 'Diversos',
    icone: '🎉',
    emojis:
      '🎉 🎊 🎈 🎂 🍾 🥂 ☕ 🍺 🍕 🍔 🌮 🍦 🍩 🍪 🍫 🍿 ⚽ 🏀 🏈 🎾 🎮 🎲 🎯 🎵 🎶 🎤 🎧 🎸 🥁 🎬 📷 🌟 ⭐ 🌈 ☀️ 🌤️ ☁️ 🌧️ ⛈️ ❄️ 🔥 ⚡ 🌊 🌸 🌹 🌻 🌴 🍀 🐶 🐱 🐭 🐰 🦊 🐻 🐼 🐨 🦁 🐷 🐸 🐵 🦄 🐢 🦋 🐝 🚗 ✈️',
  },
];

// Sanitiza a lista (remove tokens inválidos que não são emoji).
const emojisDe = (cat) => cat.emojis.split(/\s+/).filter((e) => e && /\p{Emoji}/u.test(e));

export function ChatEmojiPicker({ anchorEl, onClose, onSelecionar }) {
  const [aba, setAba] = useState(0);

  return (
    <Popover
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      slotProps={{ paper: { sx: { width: 336 } } }}
    >
      <Tabs
        value={aba}
        onChange={(_, v) => setAba(v)}
        variant="fullWidth"
        sx={{ px: 1, minHeight: 40, '& .MuiTab-root': { minHeight: 40, minWidth: 0, fontSize: 18 } }}
      >
        {CATEGORIAS.map((c) => (
          <Tab key={c.rotulo} label={c.icone} title={c.rotulo} aria-label={c.rotulo} />
        ))}
      </Tabs>

      <Box
        sx={{
          p: 1,
          height: 232,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
        }}
      >
        {emojisDe(CATEGORIAS[aba]).map((emoji) => (
          <IconButton
            key={emoji}
            onClick={() => onSelecionar?.(emoji)}
            sx={{ fontSize: 20, borderRadius: 1, p: 0.5 }}
          >
            {emoji}
          </IconButton>
        ))}
      </Box>
    </Popover>
  );
}

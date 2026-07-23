'use client';

import { useRef, useMemo, useState } from 'react';

import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Popper from '@mui/material/Popper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { avatarUrl } from 'src/utils/avatar';

// ----------------------------------------------------------------------

const normalize = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // remove marcas diacríticas para casar acentos

/**
 * Handle de menção (token único, sem espaços) inserido no texto.
 * O backend parseia o `@token` do comentário e casa com `name`/`email`, então
 * usamos o primeiro nome normalizado (ex.: "Maria Silva" -> "@maria"); se não
 * houver nome, cai no local-part do e-mail.
 */
export function mentionHandle(user) {
  if (!user) return '';
  const primeiroNome = normalize(user.name || '').split(/\s+/).filter(Boolean)[0];
  if (primeiroNome) return primeiroNome;
  return normalize((user.email || '').split('@')[0]);
}

/**
 * Dado o texto de um comentário e a lista de usuários, devolve os ids dos
 * usuários cujo `@handle` aparece no texto. Usado só para o feedback (toast) —
 * a notificação em si é disparada pelo backend ao reparsear o texto.
 */
export function getMentionedUserIds(text, users = []) {
  if (!text) return [];
  const alvo = normalize(text);
  const ids = users
    .filter((u) => {
      const h = mentionHandle(u);
      return h && new RegExp(`@${h}(?![a-z0-9._-])`).test(alvo);
    })
    .map((u) => u._id);
  return Array.from(new Set(ids));
}

// ----------------------------------------------------------------------

/**
 * Campo de texto (multiline) com autocomplete de menções `@usuario`.
 * Ao digitar `@` exibe um popup de usuários internos; selecionar insere `@Nome `.
 *
 * @param {object}   props
 * @param {string}   props.value
 * @param {(text: string) => void} props.onChange
 * @param {Array}    props.users      usuários disponíveis para menção
 * @param {object=}  props.rest       props repassadas ao TextField
 */
export function MentionInput({ value, onChange, users = [], ...rest }) {
  const inputRef = useRef(null);

  const [query, setQuery] = useState(null); // null = popup inativo
  const [tokenStart, setTokenStart] = useState(-1);
  const [highlight, setHighlight] = useState(0);

  const suggestions = useMemo(() => {
    if (query == null) return [];
    const q = normalize(query).replace(/\s/g, '');
    return users
      .filter((u) => normalize(u.name || u.email).replace(/\s/g, '').includes(q))
      .slice(0, 6);
  }, [query, users]);

  const open = query != null && suggestions.length > 0;

  const detectarToken = (text, caret) => {
    const ateCaret = text.slice(0, caret);
    const at = ateCaret.lastIndexOf('@');
    if (at === -1) {
      setQuery(null);
      return;
    }
    // O `@` precisa estar no começo ou após um espaço/quebra.
    const anterior = at === 0 ? ' ' : ateCaret[at - 1];
    if (!/\s/.test(anterior)) {
      setQuery(null);
      return;
    }
    const q = ateCaret.slice(at + 1);
    if (q.includes('\n') || q.length > 30) {
      setQuery(null);
      return;
    }
    setTokenStart(at);
    setQuery(q);
    setHighlight(0);
  };

  const handleChange = (e) => {
    onChange(e.target.value);
    detectarToken(e.target.value, e.target.selectionStart);
  };

  const selecionar = (user) => {
    if (!user || tokenStart < 0 || !inputRef.current) return;
    const el = inputRef.current;
    const caret = el.selectionStart;
    const handle = mentionHandle(user);
    const novoTexto = `${value.slice(0, tokenStart)}@${handle} ${value.slice(caret)}`;
    onChange(novoTexto);
    setQuery(null);

    const novoCaret = tokenStart + handle.length + 2;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(novoCaret, novoCaret);
    });
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      selecionar(suggestions[highlight]);
    } else if (e.key === 'Escape') {
      setQuery(null);
    }
  };

  return (
    <>
      <TextField
        {...rest}
        inputRef={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        multiline
      />

      <Popper
        open={open}
        anchorEl={inputRef.current}
        placement="bottom-start"
        style={{ zIndex: 1500 }}
      >
        <ClickAwayListener onClickAway={() => setQuery(null)}>
          <Paper sx={{ mt: 0.5, width: 260, boxShadow: (theme) => theme.customShadows?.dropdown }}>
            <MenuList dense>
              {suggestions.map((u, i) => (
                <MenuItem key={u._id} selected={i === highlight} onClick={() => selecionar(u)}>
                  <Avatar
                    sx={{ width: 26, height: 26, mr: 1, fontSize: 13 }}
                    src={avatarUrl(u) || u.avatarUrl}
                  >
                    {(u.name || '?').charAt(0).toUpperCase()}
                  </Avatar>
                  <div style={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {u.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {u.email}
                    </Typography>
                  </div>
                </MenuItem>
              ))}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}

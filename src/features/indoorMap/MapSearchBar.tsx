import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { floorName } from './directions'
import { CAT_ICON, searchLocations, type MapLocation } from './locations'

interface MapSearchBarProps {
  /** Controlled query text (owned by the map so map clicks/chips stay in sync). */
  value: string
  onChange: (value: string) => void
  onSelect: (id: string) => void
  onClear: () => void
}

export default function MapSearchBar({ value, onChange, onSelect, onClear }: MapSearchBarProps) {
  const rawId = useId().replace(/[^A-Za-z0-9_-]/g, '') || 'a'
  const listId = `im-suggest-${rawId}`
  const inputId = `im-search-${rawId}`

  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  const results = useMemo(() => searchLocations(value), [value])
  const trimmed = value.trim()
  const showList = open && trimmed.length > 0

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => {
    if (open) itemRefs.current[active]?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const choose = (loc: MapLocation) => {
    setOpen(false)
    setActive(0)
    onSelect(loc.id)
    inputRef.current?.focus()
  }

  const clear = () => {
    setOpen(false)
    setActive(0)
    onClear()
    inputRef.current?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!showList && trimmed) {
        setOpen(true)
        return
      }
      if (!results.length) return
      const dir = e.key === 'ArrowDown' ? 1 : -1
      setActive(i => (i + dir + results.length) % results.length)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const pick = showList ? results[active] ?? results[0] : undefined
      if (pick) choose(pick)
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      if (showList) setOpen(false)
      else if (value) clear()
      return
    }
    if (e.key === 'Tab') setOpen(false)
  }

  return (
    <div className="im-search" ref={wrapRef}>
      <label htmlFor={inputId}>🎯 Where do you want to go?</label>
      <div className="im-search-field">
        <span className="im-search-ico" aria-hidden="true">🔍</span>
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-activedescendant={showList && results.length ? `${listId}-${active}` : undefined}
          aria-label="Search rooms, offices, facilities"
          placeholder="Search rooms, offices, facilities…"
          value={value}
          onChange={e => {
            onChange(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => trimmed && setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {value && (
          <button type="button" className="im-search-clear" aria-label="Clear search" onClick={clear}>
            ✕
          </button>
        )}
      </div>

      {showList && (
        <ul className="im-suggest" id={listId} role="listbox" aria-label="Search suggestions">
          {results.length === 0 && (
            <li className="im-sug-empty" role="presentation">
              No matches for “{trimmed}”
            </li>
          )}
          {results.map((loc, i) => (
            <li
              key={loc.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'im-sug on' : 'im-sug'}
              ref={el => {
                itemRefs.current[i] = el
              }}
              onMouseDown={e => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(loc)}
            >
              <span className="im-sug-ico" aria-hidden="true">{CAT_ICON[loc.category]}</span>
              <span className="im-sug-txt">
                <b>{loc.name}</b>
                {loc.detail && <em>{loc.detail}</em>}
              </span>
              <span className="im-sug-floor">{floorName(loc.floor)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

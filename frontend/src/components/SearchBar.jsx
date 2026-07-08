import Icon from './Icon'

function SearchBar({ placeholder = 'Search events, clubs, or workshops...', ...props }) {
  return (
    <label className="search-bar">
      <Icon name="search" />
      <input placeholder={placeholder} {...props} />
    </label>
  )
}

export default SearchBar

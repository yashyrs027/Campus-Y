import { Link } from 'react-router-dom'
import Icon from './Icon'

function Button({ children, icon, to, variant = 'primary', className = '', ...props }) {
  const classes = `btn btn-${variant} ${className}`.trim()
  const content = (
    <>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </>
  )

  if (to) {
    return (
      <Link className={classes} to={to}>
        {content}
      </Link>
    )
  }

  return (
    <button className={classes} type="button" {...props}>
      {content}
    </button>
  )
}

export default Button

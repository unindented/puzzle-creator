import {minRows, maxRows, minCols, maxCols} from 'utils/settings'

export function validateProps (props) {
  const {rows, cols, custom} = props
  return (
    rows >= minRows && rows <= maxRows &&
    cols >= minCols && cols <= maxCols &&
    !custom
  )
}

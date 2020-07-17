/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.addColumns('permissions', {
    data_path: { type: 'text' }
  })
}

exports.down = (pgm) => {
  pgm.dropColumns('permissions', 'data_path')
}

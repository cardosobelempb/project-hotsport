const schema = {
  id: { type: 'number', required: true },
  active: { type: 'boolean', default: false },
  name: { type: 'string', required: true },
  age: { type: 'number', required: false },
}

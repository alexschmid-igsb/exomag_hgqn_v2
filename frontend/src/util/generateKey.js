import _ from 'lodash'

const src = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F']

export default function generateKey(n) {
    return _.times(n, () => src[_.random(src.length-1)]).join('')
}
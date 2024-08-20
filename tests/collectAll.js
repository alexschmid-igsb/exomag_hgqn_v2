

const lodash = require('lodash')


// import collectAll from '../frontend/src/util/collectAll.js'


const collectAll = require('../frontend/src/util/collectAll')






let data = {
    "_id": "HGNC:13417",
    "type": "HGNC",
    "hgnc": {
      "id": "HGNC:13417",
      "symbol": "PPP2R3B"
    },
    "occurrences": [
      {
        "pos": {
          "chr": "Y",
          "start": 333933,
          "end": 386955
        },
        "synonyms": [
          "PPP2R3L",
          "PPP2R3LY",
          "PR48",
          "PR70"
        ],
        "ncbi": [
          "28227"
        ],
        "ensembl": [
            [
                {obs: 'alt1'},
                {obs: 123}
            ],
            [
                {obs: "ENSG00000292327"},
                {obs: "ENSG00000292330"},                
            ]
        ],
        "_id": {
          "$oid": "66c311a10417998a11a6a755"
        }
      },
      {
        "pos": {
          "chr": "X",
          "start": 333933,
          "end": 386955
        },
        "synonyms": [
          "PPP2R3L",
          "PPP2R3LY",
          "PR48",
          "PR70"
        ],
        "ncbi": [
            ['nei1','neu2'],
            ['hellp','holel']
        ],
        "ensembl": [
          "ENSG00000167393"
        ],
        "_id": {
          "$oid": "66c311a10417998a11a6a756"
        }
      }
    ],
    "__v": 0
  }




let result = collectAll(data, [
    'hgnc.symbol',
    'occurrences[].synonyms[]',
    'occurrences[].pos.start',
    'occurrences[].ensembl[][].obs',
    'occurrences[].ncbi[][]',
]
)



console.log(result)





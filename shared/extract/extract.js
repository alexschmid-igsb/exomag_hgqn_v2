const { Readable } = require('node:stream')

var tar = require('tar-stream')
const zlib = require('node:zlib')
const xz = require("xz")
const AdmZip = require('adm-zip')

const unpack_gzip = buffer => {
    return zlib.unzipSync(buffer)
}

const unpack_xz = async buffer => {
    const xzDecompressor = new xz.Decompressor()
    let result = await xzDecompressor.updatePromise(buffer)
    if (result.length <= 0) {
        result = await xzDecompressor.finalPromise()
    }
    return result
}

const parse_tar = buffer => {

    // 

    return new Promise((resolve, reject) => {

        const files = []

        const extract = tar.extract()

        extract.on('entry', (header, stream, next) => {

            const file = {
                type: header.type,
                name: header.name,
                size: header.size,
                data: Buffer.allocUnsafe(header.size)
            }

            files.push(file)

            let pos = 0

            stream.on('data', chunk => {
                file.data.fill(chunk, pos, pos + chunk.length)
                pos += chunk.length
            })

            stream.on('end', () => {
                if (pos === file.size) {
                    next()
                } else {
                    reject(new Error('extracted data length does not match the file size'))
                }
            })

            stream.on('error', error => {
                reject(error)
            })

            stream.resume()
        })

        extract.on('finish', () => {
            resolve(files)
        })

        extract.on('error', error => {
            reject(error)
        })

        Readable.from(buffer).pipe(extract)
    })
}

const extract_zip = buffer => {
    var zip = new AdmZip(buffer)
    var entries = zip.getEntries()
    const files = []
    for (let entry of entries) {
        let file = {
            name: entry.entryName,
            data: entry.getData(),
            size: entry.getData().length,
            type: entry.isDirectory ? 'directory' : 'file'
        }
        files.push(file)
    }
    return files
}

const extract = async (type, buffer) => {

    switch (type) {
        case '.tar.gz': {
            const unpacked = unpack_gzip(buffer)
            const files = await parse_tar(unpacked)
            return files
        }
        case '.tar.xz': {
            const unpacked = await unpack_xz(buffer)
            const files = await parse_tar(unpacked)
            return files
        }
        case '.zip': {
            const files = extract_zip(buffer)
            return files
        }
        default:
            throw new Error(`unsupported type: ${type}`)
    }
}

module.exports = {
    extract
}


import lodash from 'lodash'



import { Icon as IconifyIcon, InlineIcon as IconifyIconInline } from "@iconify/react"


const LinkIcon = () => <IconifyIcon className="icon" icon="pajamas:external-link"/>






export default function VariantGeneDetails({gene}) {

    const renderGeneHGNC = () => {
        let result = []

        result.push(
            <p className="title">
                <span className="symbol-name">
                    {gene.hgnc.symbol} 
                </span>
                <span className="hgnc-tag">HGNC</span>
            </p>
        )

        result.push(
            <p>
                <span className="label">HGNC ID </span><br/><a target='_blank' href={'https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/' + gene.hgnc.id }>{gene.hgnc.id}<LinkIcon/></a>
            </p>
        )

        for(let occurrence of gene.occurrences) {

            result.push(
                <p>
                    <div className="occurrence">OCCURRENCE</div>

                    <div className="section">
                        <span className="label">Range</span>
                        <span className="gene-pos">
                            <span className="build">GRCh38</span>
                            <span className="separator"></span>
                            <span className="chr">{occurrence.pos.chr}</span>
                            <span className="separator"></span>
                            <span className="start">{occurrence.pos.start}</span>&nbsp;-&nbsp;
                            <span className="end">{occurrence.pos.end}</span>
                        </span>
                    </div>

                    {
                        occurrence.synonyms.length > 0 ?
                            <div className="section">
                                <span className="label">Synonyms</span>
                                { occurrence.synonyms.map(item => <span>{item}</span>)}
                            </div>
                        :
                            null
                    }

                    {
                        occurrence.ensembl.length > 0 ?
                            <div className="section">
                                <span className="label">Ensembl</span>
                                { occurrence.ensembl.map(item => <a target='_blank' href={'https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=' + item }>{item}<LinkIcon/></a>)}
                            </div>
                        :
                            null
                    }

                    {
                        occurrence.ncbi.length > 0 ?
                            <div className="section">
                                <span className="label">NCBI</span>
                                { occurrence.ncbi.map(item => <a target='_blank' href={'https://www.ncbi.nlm.nih.gov/gene/?term=' + item }>{item}<LinkIcon/></a>)}
                            </div>
                        :
                            null
                    }
                </p>
            )
    
        }

        return <div className="variant-grid-gene-detail-view">{result}</div>
    }

    return (
        gene.type === 'HGNC' ? renderGeneHGNC() : null
    )

}

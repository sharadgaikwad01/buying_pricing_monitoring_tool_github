import { Fragment, useEffect, useState } from 'react'
import { nodeBackend } from '@utils'
import { useParams } from 'react-router-dom'
// ** Add New Modal Component
import { Download, Search, ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus, Upload, Edit, Trash, Check } from 'react-feather'
import axios from 'axios'
import AddNewModalSupplier from './AddNewModalSupplier'
import MintectDataModal from './MintectDataModal'
import LoadingSpinner from '@src/@core/components/spinner/Loading-spinner.js'


// ** Reactstrap Imports
import {
    Row,
    Col,
    Card,
    Input,
    Label,
    Button,
    CardTitle,
    CardBody,
    CardHeader,
    DropdownMenu,
    DropdownItem,
    DropdownToggle,
    UncontrolledButtonDropdown,
    Badge
} from 'reactstrap'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import  secureLocalStorage  from  "react-secure-storage"

const MySwal = withReactContent(Swal)

const View = () => {

    const { id } = useParams()
    const suppl_no = id
    const country = secureLocalStorage.getItem('country')
    const [Suppliername, setSuppliername] = useState('')
    const [modal, setModal] = useState(false)
    const handleModal = () => setModal(!modal)
    const [Supplierno, setSupplierno] = useState('')
    const [Category, setCategory] = useState('')
    const [rowData, setRowData] = useState([])
    const [countries, setcountries] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const [mintectModal, setMintectModal] = useState(false)
    const handleMintectModal = () => setMintectModal(!mintectModal)

    const handleEdit = async (e, countryname, suppl_no) => {
        setIsLoading(true)
        e.preventDefault()
        handleModal()
        await axios.get(`${nodeBackend}/buyer_supplier_details_list`, { params: { suppl_no, countryname } }).then((res) => {
            setRowData(res.data.data)
            setTimeout(function() { setIsLoading(false) }, 1000)
        })
    }
    const handleEditError = async (e) => {
        e.preventDefault()
        return MySwal.fire({
            title: 'Info!',
            text: 'There are no records to display',
            icon: 'info',
            customClass: {
                confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
        })
    }
    useEffect(async () => {
        setIsLoading(true)
        await axios.get(`${nodeBackend}/buyer_supplier_details`, { params: { suppl_no, country } }).then((res) => {
            if (res.data.data) {
                setIsLoading(false)
                if (res.data.data[0]) {
                    setSuppliername(res.data.data[0].bdm_global_umbrella_name)
                    setSupplierno(res.data.data[0].suppl_no)
                    setCategory(res.data.data[0].stratbuyer_name)
                }
                if (res.data.response) {
                    setcountries(res.data.response)
                }
            }
        })
    }, [])

    const handleMintecSearch = async (e, row) => {
        e.preventDefault()
        setIsLoading(true)
        const country_name = row.country_name
        const stratbuyer_name = row.stratbuyer_name
        await axios.get(`${nodeBackend}/getMintecData`, { params: { country_name, stratbuyer_name } }).then((res) => {
            setIsLoading(false)
            setRowData(res.data.data)
        })
        handleMintectModal()
    }

    return (
        <Fragment>
            { isLoading ? <LoadingSpinner /> : <Card className='pageBox buyer-screen'>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start mb-1'>
                    {/* <CardTitle tag='h2'>Supplier Number - {bdm_global_umbrella_no}</CardTitle> */}
                    <CardTitle tag='h2'>Country Overview</CardTitle>
                </CardHeader>
                <CardBody>
                    <Row className='g-1 filter-row'>
                    </Row>
                    <Row className='g-1 filter-row d-flex justify-content-between align-items-center'>
                        <Col className='col-auto'>
                            <Col className="row g-0 mb-1">
                                <Col className="col-auto d-flex align-items-center">
                                    <Label htmlFor="select_supplier" className="me-50">Category: </Label>
                                </Col>
                                <Col className="col-auto">
                                    <Col className="box-select server_data">
                                        <Col className="server_data_label">{Category}</Col>
                                    </Col>
                                </Col>
                            </Col>
                        </Col>
                        <Col className='mb-1 col-auto'>
                            <div className="d-block d-md-flex incr-infla align-items-center">
                                <div className="color-indicator d-flex me-1">
                                    <span className="incr-infla-badge supplier-req-infla-rate"></span> : Supplier Raised Request
                                </div>
                                <div className="color-indicator d-flex">
                                    <span className="incr-infla-badge buyer-agreed-infla-rate"> </span>: Buyer Close Request
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row className='g-1'>
                        {countries.map((row, i) => (
                            <Col className="col-auto mt-1" key={i}>
                                <Col className="country-info-box">
                                    <Col className="row d-flex justify-content-between">
                                        <Col className="col-auto align-self-end">
                                            <Col className="country-info-left">
                                                <Col className="country-name">
                                                    <span>{row.country_code}</span>
                                                </Col>
                                                <Col className="country-flag">
                                                    <img src={`${process.env.PUBLIC_URL}/flag/${row.country_code.toLowerCase()}.svg`} className="country-flag-img" />
                                                </Col>
                                            </Col>
                                        </Col>
                                        <Col className="col-auto">
                                            <Col className="incr-infla d-flex justify-content-end">
                                                <span className="incr-infla-badge supplier-req-infla-rate mb-2">{row.requested_price_increase_perc === null ? 0 : Math.round(row.requested_price_increase_perc)}%</span>
                                                <span className="incr-infla-badge buyer-agreed-infla-rate mb-2">{row.agreed_price_increase_perc === null ? 0 : Math.round(row.agreed_price_increase_perc)}%</span>
                                            </Col>
                                            <Row className='g-1'>
                                                <Col onClick={(e) => (handleMintecSearch(e, row))} className="sku-info d-flex justify-content-end align-bottom align-items-baseline align-items-end align-items">
                                                    <img src={`${process.env.PUBLIC_URL}/logo/mintec.png`} className="country-flag-img" />
                                                </Col>
                                                <Col onClick={(e) => (row.article_count > 0 ? handleEdit(e, row.country_name, Supplierno) : handleEditError(e))} className="sku-info d-flex justify-content-end align-bottom align-items-baseline align-items-end align-items">
                                                    {row.article_count ? row.article_count : 0} SKU
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Col>
                                </Col>
                            </Col>
                        ))}
                    </Row>
                </CardBody>
                <AddNewModalSupplier open={modal} handleModal={handleModal} rowData={rowData} isLoading={isLoading} />
                <MintectDataModal open={mintectModal} handleModal={handleMintectModal} rowData={rowData} />
            </Card> 
            }
            
            
        </Fragment>
    )
}

export default View
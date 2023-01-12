import { Fragment, useEffect, useState } from 'react'
import { nodeBackend } from '@utils'
import { useParams } from 'react-router-dom'
// ** Add New Modal Component
import { Download, Search, ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus, Upload, Edit, Trash, Check } from 'react-feather'
import axios from 'axios'
import AddNewModalSupplier from './AddNewModalSupplier'
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
const MySwal = withReactContent(Swal)

const View = () => {

    const { id } = useParams()
    
    const suppl_no = id
    const country = localStorage.getItem('country')
    const [Suppliername, setSuppliername] = useState('')
    const [modal, setModal] = useState(false)
    const handleModal = () => setModal(!modal)
    const [Supplierno, setSupplierno] = useState('')
    const [Category, setCategory] = useState('')
    const [rowData, setRowData] = useState([])
    const [countries, setcountries] = useState([])

    const handleEdit = async (e, countryname, suppl_no) => {

        e.preventDefault()
        handleModal()
        await axios.get(`${nodeBackend}/buyer_supplier_details_list`, { params: { suppl_no, countryname } }).then((res) => {
            setRowData(res.data.data)
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
        await axios.get(`${nodeBackend}/buyer_supplier_details`, { params: { suppl_no, country } }).then((res) => {
            if (res.data.data) {
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

    return (
        <Fragment>
            <Card className='pageBox buyer-screen'>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    {/* <CardTitle tag='h2'>Supplier Number - {bdm_global_umbrella_no}</CardTitle> */}
                </CardHeader>
                <CardBody>
                    <Row className='g-1 filter-row'>
                    </Row>
                    <Row className='g-1 filter-row'>
                        <Col className='mb-1 col-auto'>
                            <Col className="row g-0">
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
                    </Row>
                    <Row className='g-1'>
                        { countries.map((row, i) => (
                            <Col className="col-auto mt-1"  key={i}>
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
                                                <span className="incr-infla-badge incr-infla-3 mb-2">{row.requested_price_increase_perc === null ? 0 : Math.round(row.requested_price_increase_perc)}%</span>
                                                <span className="incr-infla-badge incr-infla-5 mb-2">{row.agreed_price_increase_perc === null ? 0 : Math.round(row.agreed_price_increase_perc)}%</span>
                                            </Col>

                                            <Col onClick={(e) => (row.article_count > 0 ? handleEdit(e, row.country_name, Supplierno) : handleEditError(e))} className="sku-info d-flex justify-content-end align-bottom align-items-baseline align-items-end align-items">
                                                {row.article_count ? row.article_count : 0} SKU
                                            </Col>
                                        </Col>
                                    </Col>
                                </Col>
                            </Col>
                        ))}
                    </Row>
                </CardBody>
            </Card>
            <AddNewModalSupplier open={modal} handleModal={handleModal} rowData={rowData} />
        </Fragment>
    )
}

export default View
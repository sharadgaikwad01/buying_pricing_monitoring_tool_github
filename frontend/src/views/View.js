import { Fragment, useEffect, useState } from 'react'
import { nodeBackend } from '@utils'
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

const View = () => {
    const queryParams = new URLSearchParams(window.location.search)
    const suppl_no = queryParams.get('sup')
    const country = localStorage.getItem('country')
    const [Suppliername, setSuppliername] = useState('')
    const [modal, setModal] = useState(false)
    const handleModal = () => setModal(!modal)
    // const [Artical_no, setArtical_no] = useState('')
    // const [Art_description, setArt_description] = useState('')
    // const [Art_category, setArt_category] = useState('')
    // const [Current_price, setCurrent_price] = useState('')
    // const [New_price, setNew_price] = useState('')
    const [Supplierno, setSupplierno] = useState('')
    // const [Reason_Price_change, setReason_Price_change] = useState('')
    const [rowData, setRowData] = useState([])
    const [countries, setcountries] = useState([])


    const handleEdit = async (e, countryname) => {
        e.preventDefault()
        handleModal()
        console.log(countryname)
        await axios.get(`${nodeBackend}/buyer_supplier_details_list`, { params: { countryname } }).then((res) => {
            console.log(res.data.data)
            setRowData(res.data.data)
          })
        //setRowData(id)
    }
    useEffect(async () => {
        // if (!suppl_no) {
        //   props.history.push('/buyer_input')
        // }
    
        await axios.get(`${nodeBackend}/buyer_supplier_details`, { params: { suppl_no, country } }).then((res) => {
          if (res.data.data) {
            console.log(res.data.data[0])
            if (res.data.data[0]) {
                setSuppliername(res.data.data[0].bdm_global_umbrella_name)
                setSupplierno(res.data.data[0].bdm_global_umbrella_no)
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
                    {/* <CardTitle tag='h2'>Supplier Number - {suppl_no}</CardTitle> */}
                </CardHeader>
                <CardBody>
                    <Row className='g-1 filter-row'>
                    </Row>
                    <Row className='g-1 filter-row'>
                        <Col className='mb-1 col-auto'>
                            <Col className="row g-0">
                                <Col className="col-auto d-flex align-items-center">
                                    <Label htmlFor="select_supplier" className="me-50">Global Umbrella name</Label>
                                </Col>
                                <Col className="col-auto">
                                    <Col className="box-select server_data">
                                    <Col className="server_data_label">{Suppliername}</Col>
                                    </Col>
                                </Col>
                            </Col>
                        </Col>

                        <Col className='mb-1 col-auto'>
                            <Col className="row g-0">
                                <Col className="col-auto d-flex align-items-center">
                                    <Label htmlFor="select_supplier" className="me-50">Global Umbrella No</Label>
                                </Col>
                                <Col className="col-auto">
                                    <Col className="box-select server_data">
                                    <Col className="server_data_label">{Supplierno}</Col>
                                    </Col>
                                </Col>
                            </Col>
                        </Col>
                    </Row>
                    <Row>
                    {countries.map(row => (
                        <Col className="col-auto mt-1">
                            <Col className="country-info-box">
                                <Col className="row">
                                    <Col className="col-auto align-self-end">
                                        <Col className="country-info-left">
                                            <Col className="country-name">
                                                <span>{ row.country_code }</span>
                                            </Col>
                                            <Col className="country-flag">
                                                <img src={`${process.env.PUBLIC_URL}/flag/${row.country_code.toLowerCase()}.svg`}className="country-flag-img" />
                                            </Col>
                                        </Col>
                                    </Col>
                                    <Col className="col-auto">
                                        <Col className="incr-infla d-flex justify-content-end">
                                            <span className="incr-infla-badge incr-infla-3 mb-2">{ row.requested_price_increase_perc === null ? 0 : row.requested_price_increase_perc }%</span>
                                            <span className="incr-infla-badge incr-infla-5 mb-2">{ row.agreed_price_increase_perc === null ? 0 : row.agreed_price_increase_perc }%</span>
                                        </Col>
                                        
                                        <Col onClick={(e) => (row.article_count > 0 ? handleEdit(e, row.country_name) : '')} className="sku-info d-flex justify-content-end align-bottom align-items-baseline align-items-end align-items">
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

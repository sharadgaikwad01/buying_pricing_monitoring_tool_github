import { Fragment, useEffect, useState } from 'react'
import { nodeBackend } from '@utils'
// ** Add New Modal Component
import { Download, Search, ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus, Upload, Edit, Trash, Check } from 'react-feather'
import axios from 'axios'

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

const countries = [
    "RO", 
    "SK", 
    "DE", 
    "CZ", 
    "IT"
]

const queryParams = new URLSearchParams(window.location.search)
const suppl_no = queryParams.get('sup')


const View = () => {
    const [Suppliername, setSuppliername] = useState('')
    // const [Artical_no, setArtical_no] = useState('')
    // const [Art_description, setArt_description] = useState('')
    // const [Art_category, setArt_category] = useState('')
    const [Current_price, setCurrent_price] = useState('')
    const [New_price, setNew_price] = useState('')
    const [Request_date, setRequest_date] = useState('')
    const [Reason_Price_change, setReason_Price_change] = useState('')
    
    useEffect(async () => {
        // if (!suppl_no) {
        //   props.history.push('/buyer_input')
        // }
    
        await axios.get(`${nodeBackend}/buyer_supplier_details`, { params: { suppl_no } }).then((res) => {
          if (res.data.data) {
            console.log(res.data.data.rows[0])
            if (res.data.data.rows[0]) {
                setSuppliername(res.data.data.rows[0].suppl_name)
                // setArtical_no(res.data.data.rows[0].art_no)
                // setArt_description(res.data.data.rows[0].art_name_tl)
                // setArt_category(res.data.data.rows[0].suppl_name)
                setCurrent_price(res.data.data.rows[0].current_price ? res.data.data.rows[0].current_price : "NA")
                setNew_price(res.data.data.rows[0].new_price)
                setRequest_date(res.data.data.rows[0].request_date)
                setReason_Price_change(res.data.data.rows[0].price_change_reason)
            }
          }      
        })
      }, [])

    return (
        <Fragment>
            <Card className='pageBox buyer-screen'>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h2'>Supplier Number - {suppl_no}</CardTitle>
                </CardHeader>
                <CardBody>
                    <Row className='g-1 filter-row'>
                    </Row>
                    <Row className='g-1 filter-row'>
                        <Col className='mb-1 col-auto'>
                            <Col className="row g-0">
                                <Col className="col-auto d-flex align-items-center">
                                    <Label htmlFor="select_supplier" className="me-50">Supplier name</Label>
                                </Col>
                                <Col className="col-auto">
                                    <Col className="box-select server_data">
                                    <Col className="server_data_label">{Suppliername}</Col>
                                    </Col>
                                </Col>
                            </Col>
                        </Col>

                        {/* <Col className='mb-1 col-auto'>
                            <Col className="row g-0">
                                <Col className="col-auto d-flex align-items-center">
                                    <Label htmlFor="select_supplier" className="me-50">Article Number</Label>
                                </Col>
                                <Col className="col-auto">
                                    <Col className="box-select server_data">
                                    <Col className="server_data_label">{Artical_no}</Col>
                                    </Col>
                                </Col>
                            </Col>
                        </Col> */}

                        {/* <Col className='mb-1 col-auto'>
                            <Col className="row g-0">
                                <Col className="col-auto d-flex align-items-center">
                                    <Label htmlFor="select_supplier" className="me-50">Article Description</Label>
                                </Col>
                                <Col className="col-auto">
                                    <Col className="box-select server_data">
                                    <Col className="server_data_label"> {Art_description }</Col>
                                    </Col>
                                </Col>
                            </Col>
                        </Col> */}

                        {/* <Col className='mb-1 col-auto'>
                            <Col className="row g-0">
                                <Col className="col-auto d-flex align-items-center">
                                    <Label htmlFor="select_supplier" className="me-50">Category</Label>
                                </Col>
                                <Col className="col-auto">
                                    <Col className="box-select server_data">
                                    <Col className="server_data_label">{Art_category}</Col>
                                    </Col>
                                </Col>
                            </Col>
                        </Col> */}
                        {/* </Row>
                        <Row> */}

                        <Col className='mb-1 col-auto'>
                            <Col className="row g-0">
                                <Col className="col-auto d-flex align-items-center">
                                    <Label htmlFor="select_supplier" className="me-50">Current price</Label>
                                </Col>
                                <Col className="col-auto">
                                    <Col className="box-select server_data">
                                    <Col className="server_data_label">{Current_price}</Col>
                                    </Col>
                                </Col>
                            </Col>
                        </Col>

                        <Col className='mb-1 col-auto'>
                            <Col className="row g-0">
                                <Col className="col-auto d-flex align-items-center">
                                    <Label htmlFor="select_supplier" className="me-50">New Price</Label>
                                </Col>
                                <Col className="col-auto">
                                    <Col className="box-select server_data">
                                    <Col className="server_data_label">{New_price}</Col>
                                    </Col>
                                </Col>
                            </Col>
                        </Col>

                        <Col className='mb-1 col-auto'>
                            <Col className="row g-0">
                                <Col className="col-auto d-flex align-items-center">
                                    <Label htmlFor="select_supplier" className="me-50">Request Date</Label>
                                </Col>
                                <Col className="col-auto">
                                    <Col className="box-select server_data">
                                    <Col className="server_data_label">{Request_date}</Col>
                                    </Col>
                                </Col>
                            </Col>
                        </Col>

                        <Col className='mb-1 col-auto'>
                            <Col className="row g-0">
                                <Col className="col-auto d-flex align-items-center">
                                    <Label htmlFor="select_supplier" className="me-50">Reason for Price Increase</Label>
                                </Col>
                                <Col className="col-auto">
                                    <Col className="box-select server_data">
                                    <Col className="server_data_label">{Reason_Price_change}</Col>
                                    </Col>
                                </Col>
                            </Col>
                        </Col>
                    </Row>
                    <Row>
                    {countries.map(country => (
                        <Col className="col-auto mt-1">
                            <Col className="country-info-box">
                                <Col className="row">
                                    <Col className="col-auto align-self-end">
                                        <Col className="country-info-left">
                                            <Col className="country-name">
                                                <span>{ country }</span>
                                            </Col>
                                            <Col className="country-flag">
                                                <img src={`${process.env.PUBLIC_URL}/flag/${country.toLowerCase()}.svg`}className="country-flag-img" />
                                            </Col>
                                        </Col>
                                    </Col>
                                    <Col className="col-auto">
                                        <Col className="incr-infla d-flex justify-content-end">
                                            <span className="incr-infla-badge incr-infla-1 mb-2">2%</span>
                                        </Col>
                                        <Col className="sku-info d-flex justify-content-end align-bottom align-items-baseline align-items-end align-items">
                                            6 SKU
                                        </Col>
                                    </Col>
                                </Col>
                            </Col>
                        </Col>
                    ))} 
                    </Row>
                </CardBody>
            </Card>
        </Fragment>
    )
}

export default View

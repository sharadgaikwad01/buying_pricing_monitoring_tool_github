
import { Fragment } from 'react'

// import { selectThemeColors, nodeBackend } from '@utils'

// ** Add New Modal Component
import { Download, Search, ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus, Upload, Edit, Trash, Check } from 'react-feather'

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

const BuyerInput = () => {
    return (
        <Fragment>
            <Card className='pageBox buyer-screen'>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h2'>Supplier Number - </CardTitle>
                </CardHeader>
                <CardBody>
                    <Row className='g-1 filter-row'>
                    </Row>
                    <Row className='g-1 filter-row'>
                        <Col className='mb-1 col-auto'>
                            <div class="row g-0">
                                <div class="col-auto d-flex align-items-center">
                                    <label for="select_supplier" class="me-50">Article Number</label>
                                </div>
                                <div class="col-auto">
                                    <div class="box-select server_data">
                                        <div class="server_data_label">459876</div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <div className="col-auto">
                        <div className="country-info-box">
                            <div className="row ">
                                <div className="col-auto align-self-end">
                                    <div className="country-info-left">
                                        <div className="country-name">
                                            <span className>RO</span>
                                        </div>
                                        <div className="country-flag">
                                            <img src="../app-assets/fonts/flag-icon-css/flags/4x3/ro.svg" className="country-flag-img" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-auto ">
                                    <div className="incr-infla d-flex justify-content-end">
                                        <span className="incr-infla-badge incr-infla-1 mb-2">2%</span>
                                    </div>
                                    <div className="sku-info d-flex justify-content-end align-bottom align-items-baseline align-items-end align-items">
                                        6 SKU
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Fragment>
    )
}
export default BuyerInput

// ** Table Data & Columns
// import { columns } from './dataUsers'
import { Fragment, useState, useEffect } from 'react'
import axios from 'axios'

import { nodeBackend } from '@utils'
import LoadingSpinner from '@src/@core/components/spinner/Loading-spinner.js'

import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import { Edit, Trash, ChevronDown } from 'react-feather'

import '@styles/react/libs/tables/react-dataTable-component.scss'
import '@styles/react/libs/flatpickr/flatpickr.scss'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import HeatMap from "react-heatmap-grid"

import { Link } from 'react-router-dom'

// ** Reactstrap Imports
import {
  Row,
  Badge,
  Card,
  Input,
  CardTitle,
  CardBody,
  CardHeader,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
  Col,
  Label,
  Button
} from 'reactstrap'

const MySwal = withReactContent(Swal)

const Dashboard = props => {
  const [xLabels, setXLabels] = useState([])
  const [yLabels, setYLabels] = useState([])
  const [data, setData] = useState([])
  const [checkedvalue, setcheckedvalue] = useState('supplier')
  const [notificationmsg, setnotificationmsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Display all labels
  const xLabelsVisibility = new Array(22)
    .fill(0).map(() => (true))

  useEffect(async () => {

    const user_type = localStorage.getItem("type")
    if (user_type === '') {
      props.history.push('/buyer_login')
    }
    if (user_type === 'BUYER') {
      props.history.push('/buyer_input')
    }
    if (user_type === 'SUPPLIER') {
      props.history.push('/home')
    }
    setnotificationmsg('Displayed information represents the supplier ask')
    setIsLoading(true)
    await axios.get(`${nodeBackend}/dashboard`).then((res) => {
      setData(res.data.data.countryData)      
      setXLabels(res.data.data.countryCodeSeries)
      setYLabels(res.data.data.supplierName)
      setIsLoading(false)
      
    })
  }, [])

  const dataCal = (backgrounde, value, min, max, data, x, y) => {
    // console.log(x)
    // console.log(y)
    // let avg_val = 0
    const avg_val = data[y][19]    
    let max_val = 0
    let min_val = 0    
    max_val = parseInt(2 + parseInt(avg_val))
    min_val = parseInt(parseInt(avg_val) - 2)
    console.log(`Average value -------`)
    // console.log(avg_val)
    // console.log(min_val)
    // console.log(max_val)

    if (x < 19) {
      if (value <= min_val) {
        return {
          background: `#64bc7c`,
          fontSize: "11.5px",
          color: "#444"
        }
      } else if (value >= min_val && value <= max_val) {
        return {
          background: `#f6e183`,
          fontSize: "11.5px",
          color: "#444"
        }
      } else if (value >= max_val) {
        return {
          background: `#fc6c6c`,
          fontSize: "11.5px",
          color: "#444"
        }
      } else {
        return {
          background: `white`,
          fontSize: "11.5px",
          color: "#444"
        }
      }
    } else {
      return {
        background: `white`,
        fontSize: "11.5px",
        color: "#444"
      }
    }    
  }

  const onChangeValue = (event) => {
    console.log("onchange value--------------------------")
    console.log(event.target.value)
  }
  const handleEdit = async (value) => {
    //console.log(value)
    setcheckedvalue(value)
    if (value === 'buyer') {
      setIsLoading(true)
      setnotificationmsg('Dashboard information view of final price agreed by category manager')
     // console.log('buyer dashboard called')
      axios.get(`${nodeBackend}/dashboard_buyer`).then((res) => {
        setData(res.data.data.countryData)
        setIsLoading(false)      
        // setXLabels(res.data.data.countryCodeSeries)
        // setYLabels(res.data.data.supplierName)
      })
    } else {
      setnotificationmsg('Displayed information represents the supplier ask')
      //console.log('supplier dashboard called')
      setIsLoading(true)
      axios.get(`${nodeBackend}/dashboard`).then((res) => {
        setData(res.data.data.countryData)
        setIsLoading(false)      
        // setXLabels(res.data.data.countryCodeSeries)
        // setYLabels(res.data.data.supplierName)
      })
    }
  }
  return (
    <Fragment>
      {isLoading ? <LoadingSpinner /> : <Card className='pageBox user-screen'>
          <CardHeader className=' border-bottom'>
            <CardTitle tag='h2'>Supplier Vs Country</CardTitle>
            <div className='card-options d-flex align-items-center'>
            <div onChange={onChangeValue}>
              {/* <input type="radio" value="supplier" onClick={() => handleEdit('supplier')} name="supplier" checked={checkedvalue === 'supplier'} className='form-check-input'/> Supplier
              <input type="radio" value="buyer" onClick={() => handleEdit('buyer')} name="supplier" checked={checkedvalue === 'buyer'} className='form-check-label'/> Catgory manager */}

              <div class="form-check form-check-inline">
                <input type="radio" value="supplier" onClick={() => handleEdit('supplier')} name="supplier" checked={checkedvalue === 'supplier'} className='form-check-input'/>
                <label class="form-check-label" for="">Request by Supplier</label>
              </div>
              <div class="form-check form-check-inline">
                <input type="radio" value="buyer" onClick={() => handleEdit('buyer')} name="supplier" checked={checkedvalue === 'buyer'} className='form-check-input'/>
                <label class="form-check-label" for="">Closed by CatMan</label>
              </div>
            </div>

            </div>
          
            <Link to={'/category_dashboard'}>
                  <Button.Ripple className='ms-1' outline color='info'>
                      <span className='align-middle ms-25'>Category Vs Country</span>
                  </Button.Ripple>
            </Link>
          </CardHeader>
          <CardBody>
          <div className='card-options bold card-info-title'>{notificationmsg}</div>
            <Row className='mt-1 mb-50 mx-auto'>
            <HeatMap
              className="heatmap-container"
              xLabels={xLabels}
              yLabels={yLabels}
              yLabelWidth={140}
              xLabelsLocation="top"
              xLabelsVisibility={xLabelsVisibility}
              xLabelWidth={60}
              data={data}
              squares
              height={50}
              cellStyle={(background, value, min, max, data, x, y) => dataCal(background, value, min, max, data, x, y)}
              cellRender={(value) => value && <div>{value === '0.00' ? 0 : value}%</div>}
              title={(value) => `${value}%`}
              style={{
                /* Apply inline styles here */
                /* For example: */
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '10px',
                backgroundColor: '#f2f2f2'
              }}
            />
            </Row>
          </CardBody>
        </Card>
      }
    </Fragment>
  )
}
export default Dashboard

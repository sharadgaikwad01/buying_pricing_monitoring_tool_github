// ** Table Data & Columns
// import { columns } from './dataUsers'
import { Fragment, useState, useEffect } from 'react'
import axios from 'axios'

import { nodeBackend } from '@utils'

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

const CategoryDashboard = () => {
  const [xLabels, setXLabels] = useState([])
  const [yLabels, setYLabels] = useState([])
  const [data, setData] = useState([])

  // Display all labels
  const xLabelsVisibility = new Array(22)
    .fill(0).map(() => (true))

  useEffect(async () => {
    await axios.get(`${nodeBackend}/category_dashboard`).then((res) => {
      setData(res.data.data.countryData)      
      setXLabels(res.data.data.countryCodeSeries)
      setYLabels(res.data.data.categoryName)
    })
  }, [])

  const dataCal = (backgrounde, value, min, max, data, x, y) => {
    console.log(x)
    console.log(y)
    let avg_val = 0
    avg_val = data[y][19]    
    let max_val = 0
    let min_val = 0    
    max_val = 2 + avg_val
    min_val = avg_val - 2

    if (x < 19)  {
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


  return (
    <Fragment>
      <Card className='pageBox user-screen'>
        <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
          <CardTitle tag='h2'>Category Vs Country</CardTitle>
            <Link to={'/dashboard'}>
                <Button.Ripple className='ms-1' outline color='info'>
                    <span className='align-middle ms-25'>Supplier Vs Country</span>
                </Button.Ripple>
            </Link>
        </CardHeader>
        <CardBody>
          <Row className='mt-1 mb-50 mx-auto'>
            <HeatMap
              xLabels={xLabels}
              yLabels={yLabels}
              yLabelWidth={140}
              xLabelsLocation={"top"}
              xLabelsVisibility={xLabelsVisibility}
              xLabelWidth={60}
              data={data}
              squares
              height={50}
              cellStyle={(backgrounde, value, min, max, data, x, y) => dataCal(backgrounde, value, min, max, data, x, y)}
              cellRender={(value) => value && <div>{value === '0.00' ? 0 : value}%</div>}
            />
          </Row>
        </CardBody>
      </Card>
    </Fragment>
  )
}
export default CategoryDashboard
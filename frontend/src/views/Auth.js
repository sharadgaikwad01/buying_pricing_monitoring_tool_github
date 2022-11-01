import React, { Component } from 'react'
// import axios from 'axios'

export default class Auth extends Component {
    async componentDidMount() {
        const searchParams = new URLSearchParams(this.props.location.search)
        const id = searchParams.get("id")
        const token = searchParams.get("token")
        const email = searchParams.get("email")
        const type = searchParams.get("type")
        const country = searchParams.get("country")
        const vat = searchParams.get("vat")

        if (searchParams.has('id') && searchParams.has('token') && searchParams.has('email') && searchParams.has('type') && searchParams.has('country')) {

            localStorage.setItem("id", id)
            localStorage.setItem("token", token)
            localStorage.setItem("email", email)
            localStorage.setItem("type", type)
            localStorage.setItem("country", country)
            if (type === 'BUYER') {
                this.props.history.push('/buyer_input')
            } else {
                localStorage.setItem("vat", vat)
                this.props.history.push('/home')
            }
        } else {
            this.props.history.push({ pathname: '/notAuthorized', search: '?error=User Not Exist' })
        }
    }
    render() {
        return (
            <div>

            </div>
        )
    }
}


import React from "react"
import PropTypes from "prop-types"

function getCookie(name) {
  var st = ""
  var ed = ""
  if (document.cookie.length > 0) {
      st = document.cookie.indexOf(name + "=")
      if (st != -1) {
          st = st + name.length + 1
          ed = document.cookie.indexOf(";", st)
          if (ed == -1) ed = document.cookie.length
          return unescape(document.cookie.substring(st, ed))
      }
  }
  return ""
}

export default class ApiKeyAuth extends React.Component {
  static propTypes = {
    authorized: PropTypes.object,
    getComponent: PropTypes.func.isRequired,
    errSelectors: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func
  }

  constructor(props, context) {
    super(props, context)
    let { name, schema } = this.props
    let value: string
    if (schema.get("in") !== "cookie") {
       value = this.getValue()
    } else {
      value = getCookie(schema.get("name"))
      let { onChange } = this.props
      onChange({
        name: name,
        schema: schema,
        value: value
      })
    }

 

    this.state = {
      name: name,
      schema: schema,
      value: value
    }
  }

  getValue () {
    let { name, authorized } = this.props

    return authorized && authorized.getIn([name, "value"])
  }

  onChange =(e) => {
    let { onChange } = this.props
    let value = e.target.value
    let newState = Object.assign({}, this.state, { value: value })

    this.setState(newState)
    onChange(newState)
  }

  render() {
    let { schema, getComponent, errSelectors, name } = this.props
    const Input = getComponent("Input")
    const Row = getComponent("Row")
    const Col = getComponent("Col")
    const AuthError = getComponent("authError")
    const Markdown = getComponent( "Markdown" )
    const JumpToPath = getComponent("JumpToPath", true)
    let value = this.getValue()
    let errors = errSelectors.allErrors().filter( err => err.get("authId") === name)

    return (
      <div>
        <h4>
          <code>{ name || schema.get("name") }</code>&nbsp;
          (apiKey)
          <JumpToPath path={[ "securityDefinitions", name ]} />
        </h4>
        { value && <h6>Authorized</h6>}
        <Row>
          <Markdown source={ schema.get("description") } />
        </Row>
        <Row>
          <p>Name: <code>{ schema.get("name") }</code></p>
        </Row>
        <Row>
          <p>In: <code>{ schema.get("in") }</code></p>
        </Row>
        <Row>
          <label>Value:</label>
          {
            value ? <code> ****** </code>
                  : <Col><Input type="text" disabled={schema.get("in")==="cookie"} value={this.state.value} onChange={ this.onChange }/></Col>
          }
        </Row>
        {
          errors.valueSeq().map( (error, key) => {
            return <AuthError error={ error }
                              key={ key }/>
          } )
        }
      </div>
    )
  }
}

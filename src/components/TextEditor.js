import React, {Component} from 'react'
import { Editor } from 'slate-react'
import Types from 'prop-types'
import SlateTypes from 'slate-prop-types'
import {  Value } from 'slate'
import { Button, Icon, Toolbar }  from './menu/item'
import  './editor.css'
import {isKeyHotkey} from 'is-hotkey'
import styled from 'react-emotion'
// import { LAST_CHILD_TYPE_INVALID } from 'slate-schema-violations'

const initialValue = Value.fromJSON({
    document: {
        nodes: [
            {
                object: 'block',
                type: 'paragraph',
                nodes: [
                    {
                        object: 'text',
                        leaves: [
                            {
                                text: 'This is Paragraph'
                            }
                        ]
                    }
                   
                ]
            },
            {
                object: 'block',
                type: 'paragraph',
                nodes: [
                    {
                        object: 'text',
                        leaves: [
                            {
                                text: ''
                            }
                        ]
                    }
                   
                ]
            }
        ]
    }
})

const Image = styled('img')`
   display: block;
   max-width: 100%;
   max-height: 20em;
   box-shadow: ${ props => (props.selected ? '0 0 0 2px blue;': 'none')};
`
const isBoldHotkey = isKeyHotkey('mod+b')
const isItalicHotkey = isKeyHotkey('mod+i')
const isUnderlinedHotkey = isKeyHotkey('mod+u')
const isCodeHotkey = isKeyHotkey('mod+`')

function insertImage(change, src, target) {
    if(target) {
        change.select(target)
    }

    change.insertBlock({
        type: 'image',
        isVoid: true,
        data: {src}
    })
}

// const schema = {
//     document: {
//         last: { type: 'paragraph'},
//         normalize: (change, reason) => {
//             const paragraph = Block.create('paragraph')
//             switch(reason) {
//                 case LAST_CHILD_TYPE_INVALID: {
//                     return change.insertNodeByKey(reason.child.key, paragraph)
//                 }
//                 default:
//                     return change.insertNodeByKey(reason.child.key, paragraph)
//             }
//         }
//     }
// }

export default class TextEditor extends Component {
  constructor(props) {
      super(props)
      this.state = {
          value: initialValue
      }
  }

  static propTypes = {
    autoCorrect: Types.bool,
    autoFocus: Types.bool,
    className: Types.string,
    onChange: Types.func,
    placeholder: Types.any,
    plugins: Types.array,
    readOnly: Types.bool,
    role: Types.string,
    schema: Types.object,
    spellCheck: Types.bool,
    style: Types.object,
    tabIndex: Types.number,
    value: SlateTypes.value.isRequired,
  }

  onChange = ({value}) => {
     this.setState({value})
  }

  onFileChange = (event) => {
    let file = event.target.files[0]
    let objectUrl = URL.createObjectURL(file)
    const change = this.state.value.change().call(insertImage, objectUrl)
    this.onChange(change)
  }

  renderNode = props => {
      const { attributes, node, children, isFocused } = props
      switch(node.type) {
          case 'image': {
              const src = node.data.get('src')
              return <Image src={src} selected={isFocused} {...attributes} />
          }
            case 'block-quote':
             return <blockquote {...attributes}>{children}</blockquote>
            case 'bulleted-list':
            return <ul {...attributes}>{children}</ul>
            case 'heading-one':
            return <h1 {...attributes}>{children}</h1>
            case 'heading-two':
            return <h2 {...attributes}>{children}</h2>
            case 'list-item':
            return <li {...attributes}>{children}</li>
            case 'numbered-list':
            return <ol {...attributes}>{children}</ol>
            default:
            return <p {...attributes}>{children}</p>
      }
  }

  renderMarkButton = (type, icon) => {
      const isActive = this.hasMark(type)

      return (
          <Button
            active={isActive}
            onMouseDown = { event=> this.onClickMark(event, type)}
            >
            <Icon>{icon}</Icon>
          </Button>  
      )
  }

  onClickMark = (event, type) => {
      event.preventDefault()
      const {value} = this.state
      const change = value.change().toggleMark(type)
      this.onChange(change)
  }

  hasMark = type => {
      const {value} = this.state
      return value.activeMarks.some(mark => mark.type === type)
  }

  onKeyDown = (event, change) => {
    let mark

    if (isBoldHotkey(event)) {
      mark = 'bold'
    } else if (isItalicHotkey(event)) {
      mark = 'italic'
    } else if (isUnderlinedHotkey(event)) {
      mark = 'underlined'
    } else if (isCodeHotkey(event)) {
      mark = 'code'
    } else {
      return
    }

    event.preventDefault()
    change.toggleMark(mark)
    return true
  }

  renderMark = props => {
    const { children, mark, attributes } = props

    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>
      case 'code':
        return <code {...attributes}>{children}</code>
      case 'italic':
        return <em {...attributes}>{children}</em>
      case 'underlined':
        return <u {...attributes}>{children}</u>
      default:
        return
    }
  }

  render() {
      return (
        <div>
        <Toolbar>
        {this.renderMarkButton('bold', 'format_bold')}
        {this.renderMarkButton('italic', 'format_italic')}
        {this.renderMarkButton('underlined', 'format_underlined')}
        {this.renderMarkButton('code', 'code')}
        <label>
        <i class="material-icons">add_a_photo</i>
          <input className={'hide'}  type="file" onChange={this.onFileChange} />
          </label>
        </Toolbar>
        <Editor 
        value={this.state.value}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        renderNode={this.renderNode}
        renderMark={this.renderMark}
         />
        </div>
      )
  }
}
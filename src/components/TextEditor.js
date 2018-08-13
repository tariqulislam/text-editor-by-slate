import React, {Component} from 'react'
import { Editor } from 'slate-react'

import Types from 'prop-types'
import SlateTypes from 'slate-prop-types'
import {  Value } from 'slate'
import { Button, Icon, Toolbar }  from './menu/item'
import  './editor.css'
import {isKeyHotkey} from 'is-hotkey'
import styled from 'react-emotion'

import PluginEditList from './lib'

const plugin = PluginEditList();
const DEFAULT_NODE = 'paragraph'
const plugins = [plugin]

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
    isSelectionInList: Types.func,
    getItemAtRange: Types.func,
    value: SlateTypes.value.isRequired,
  }

  onChange = ({value}) => {
     this.setState({value})
  }

  call(change) {
      this.setState({
          value: this.state.value.change().call(change).value
      })
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
          case 'ul_list':
             return <ul {...attributes}>{children}</ul>
          case 'ol_list':
             return <ol {...attributes}>{children}</ol>
          case 'list_item':
            return (
                <li {...props.attributes}>{props.children}</li>    
            );
            case 'block-quote':
             return <blockquote {...attributes}>{children}</blockquote>
            case 'heading-one':
            return <h1 {...attributes}>{children}</h1>
            case 'heading-two':
            return <h2 {...attributes}>{children}</h2>
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

  hasBlock = type => {
    const { value } = this.state
    return value.blocks.some(node => node.type === type)
  }

  onClickBlock = (event, type) => {
    event.preventDefault()
    const { value } = this.state
    const change = value.change()
    const { document } = value

    // Handle everything but list buttons.
    if (type !== 'ol_list' && type !== 'ul_list') {
      const isActive = this.hasBlock(type)
      const isList = this.hasBlock('list_item')

      if (isList) {
        change
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('ul_list')
          .unwrapBlock('ol_list')
      } else {
        change.setBlocks(isActive ? DEFAULT_NODE : type)
      }
    } else {
      // Handle the extra wrapping required for list buttons.
      const isList = this.hasBlock('list_item')
      const isType = value.blocks.some(block => {
        return !!document.getClosest(block.key, parent => parent.type === type)
      })

      if (isList && isType) {
        change
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock('ol_list')
          .unwrapBlock('ul_list')
      } else if (isList) {
        change
          .unwrapBlock(
            type === 'ol-list' ? 'ul_list' : 'ol_list'
          )
          .wrapBlock(type)
      } else {
        change.setBlocks('list_item').wrapBlock(type)
      }
    }

    this.onChange(change)
  }


  renderBlockButton = (type, icon) => {
    let isActive = this.hasBlock(type)

    if (['ol_list', 'ul_list'].includes(type)) {
      const { value } = this.state
      const parent = value.document.getParent(value.blocks.first().key)
      isActive = this.hasBlock('list_item') && parent && parent.type === type
    }

    return (
      <Button
        active={isActive}
        onMouseDown={event => this.onClickBlock(event, type)}
      >
        <Icon>{icon}</Icon>
      </Button>
    )
  }


  render() {
    const {
    
        wrapInList,
        unwrapList,
        increaseItemDepth,
        decreaseItemDepth,
        wrapInNumList,
    } = plugin.changes
    const inList = plugin.utils.isSelectionInList(this.state.value)

      return (
        <div className={`alignArticles`}>
        <Toolbar>
        {this.renderMarkButton('bold', 'format_bold')}
        {this.renderMarkButton('italic', 'format_italic')}
        {this.renderMarkButton('underlined', 'format_underlined')}
        {this.renderMarkButton('code', 'code')}
        {this.renderBlockButton('heading-one', 'looks_one')}
        {this.renderBlockButton('heading-two', 'looks_two')}
        {this.renderBlockButton('block-quote', 'format_quote')}
        <button className={'removeButton'} onClick={() => this.call(inList ? unwrapList : wrapInNumList)}><i className={`material-icons iconColor`}>format_list_numbered</i> </button>
        <button className={'removeButton'} onClick={() => this.call(inList ? unwrapList : wrapInList)}><i className={`material-icons iconColor`}>format_list_bulleted</i> </button>
        <button className={inList ? 'removeButton' : 'removeButton disabled'} onClick={() => this.call(decreaseItemDepth)}><i className={`material-icons iconColor`}>format_indent_decrease</i> </button>
        <button className={inList ? 'removeButton' : 'removeButton disabled'} onClick={() => this.call(increaseItemDepth)}><i class={`material-icons iconColor`}>format_indent_increase</i></button>
        <label>
        <i className={`material-icons iconColor`}>add_a_photo</i>
          <input className={'hide'}  type="file" onChange={this.onFileChange} />
          </label>
        </Toolbar>
        <Editor
        placeholder={'Enter some text.....'}
        plugins={plugins}
        value={this.state.value}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        renderNode={this.renderNode}
        renderMark={this.renderMark}
        shouldNodeComponentUpdate={props => props.node.type === 'list_item' }
         />
        </div>
      )
  }
}
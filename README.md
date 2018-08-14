# Text Editor by Slate JS

## Rich Text Editor Build

## add the editor initial value for Rich Text Editor
```javascript
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
                                text: 'Enter Article Title Here'
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
```

## Image Upload By Editor and Save As Content

1. Create the Image Field by `react-emotions`

```javascript
const Image = styled('img')`
   display: block;
   max-width: 100%;
   max-height: 20em;
   box-shadow: ${ props => (props.selected ? '0 0 0 2px blue;': 'none')};
`
```
2. Add the Image Icone In Tool bar 

```javascript
 <Toolbar>   
  <label>
  <i className={`material-icons iconColor`}>add_a_photo</i>
    <input className={'hide'}  type="file" onChange={this.onFileChange} />
    </label>
</Toolbar>
```
3. Open File Browser and Render The Image When click the Image Icon

```javascript
 renderNode = props => {
      const { attributes, node, children, isFocused } = props

      switch(node.type) {
          case 'image': {
              const src = node.data.get('src')
              return <Image src={src} selected={isFocused} {...attributes} />
          }
          
        default:
        return <p {...attributes}>{children}</p>
      }
  }
```

```javascript
  onFileChange = (event) => {
    let file = event.target.files[0]
    let objectUrl = URL.createObjectURL(file)
    const change = this.state.value.change().call(insertImage, objectUrl)
    this.onChange(change)
  }
```


## List with edit functionality using 3 level

1. Add the 4 buttons for design the list with level 3

```javascript
 <button className={'removeButton'} onClick={() => this.call(inList ? unwrapList : wrapInNumList)}><i className={`material-icons iconColor`}>format_list_numbered</i> </button>
        <button className={'removeButton'} onClick={() => this.call(inList ? unwrapList : wrapInList)}><i className={`material-icons iconColor`}>format_list_bulleted</i> </button>
        <button className={inList ? 'removeButton' : 'removeButton disabled'} onClick={() => this.call(decreaseItemDepth)}><i className={`material-icons iconColor`}>format_indent_decrease</i> </button>
        <button className={inList ? 'removeButton' : 'removeButton disabled'} onClick={() => this.call(increaseItemDepth)}><i class={`material-icons iconColor`}>format_indent_increase</i></button>
```

2. Add the `case` in `switch...case` statement
```javascript
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
            default:
            return <p {...attributes}>{children}</p>
      }
  }
```
3. Change the Value for Documents and Indentations

```javascript
call(change) {
      this.setState({
          value: this.state.value.change().call(change).value
      })
  }
```

## Save Information to local Storage and Restrict the Node Limit
```javascript
onChange = ({value}) => {
    const rawContent  = value.toJSON();
    const content = JSON.stringify(rawContent);

    if(rawContent.document.nodes.length > MAX_NODE_FOR_DOCUMENT) {
      this.setState({warningState: true, errMsg: 'You Node is exists the limit. please reduce the node limit when writing.'})
    } else {
      /* save the data to local storage for further usage */
      localStorage.setItem('content', content)
      this.setState({value, warningState: false, errMsg: ''})
    }
   
  }
```

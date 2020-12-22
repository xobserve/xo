import React from 'react'
import { Tag, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

interface Props {
  color: string
  onConfirm: any
  tags: string[]
}

interface State {
  tags: string[]
  inputVisible: boolean
  inputValue: string
}

export class DynamicTagList extends React.Component<Props,State> {
  input;

  constructor(props) {
    super(props)
    this.state = {
      tags: this.props.tags,
      inputVisible: false,
      inputValue: '',
    };
  }
 

  handleClose = removedTag => {
    const tags = this.state.tags.filter(tag => tag !== removedTag);
    this.setState({ tags });
    this.props.onConfirm(tags)
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    let { tags } = this.state;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
  
    this.setState({
      tags,
      inputVisible: false,
      inputValue: '',
    });

    this.props.onConfirm(tags)
  };

  saveInputRef = input => {
    this.input = input;
  };

  forMap = tag => {
    const tagElem = (
      <Tag
        closable
        color={this.props.color}
        onClose={e => {
          e.preventDefault();
          this.handleClose(tag);
        }}
      >
        {tag}
      </Tag>
    );
    return (
      <span key={tag} style={{ display: 'inline-block' }}>
        {tagElem}
      </span>
    );
  };

  render() {
    const { tags, inputVisible, inputValue } = this.state;
    const tagChild = tags.map(this.forMap);
    return (
      <>
        <div style={{ marginBottom: 16 }}>
            {tagChild}
        </div>
        {inputVisible && (
          <Input
            className="gf-form-input"
            ref={this.saveInputRef}
            type="text"
            size="small"
            style={{ width: 78 }}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag onClick={this.showInput} className="site-tag-plus">
            <PlusOutlined /> <FormattedMessage id="dashboard.newTag"/>
          </Tag>
        )}
      </>
    );
  }
}
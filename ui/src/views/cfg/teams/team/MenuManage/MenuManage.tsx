import React from 'react'
import _ from 'lodash'
import { MenuItem } from 'src/types'
import { Tree, notification } from 'antd'

import { getBackendSrv } from 'src/core/services/backend';
import AddMenuItem from './AddMenuItem'
import ManageMenuItem from './ManageMenuItem'
import { reservedUrls } from 'src/routes';
import { injectIntl,FormattedMessage, IntlShape } from 'react-intl';
import localeData from 'src/core/library/locale'
import { getState } from 'src/store/store';

interface Props {
    value: MenuItem[]
    onChange: any
}
interface IntlProps {
    intl: IntlShape
}

interface State {
    menuItems: MenuItem[]
    drawerVisible: boolean
    selectedNode: MenuItem
}
const isUrl = new RegExp("^/[a-zA-z]+")
class MenuMange extends React.Component<Props & IntlProps, State> {
    constructor(props) {
        super(props)
        this.state = {
            menuItems: _.cloneDeep(this.props.value),
            drawerVisible: false,
            selectedNode: null
        };

        this.state.menuItems.forEach((item, i) => {
            item.level = 1
            item.key = item.id + i
            if (item.children) {
                item.children.forEach((child, j) => {
                    child.level = 2
                })
            } else {
                item.children = []
            }
        })

        this.onDrop = this.onDrop.bind(this)
        // this.onDragStart = this.onDragStart.bind(this)
        // this.onDragEnd = this.onDragEnd.bind(this)
    }

    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setState({
                ...this.state,
                menuItems: _.cloneDeep(this.props.value),
            })
        }
    }

    onDrop = info => {
        const dropKey = info.node.props.eventKey;
        const dragKey = info.dragNode.props.eventKey;
        const dropPos = info.node.props.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

        const loop = (data, key, callback) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].key === key) {
                    return callback(data[i], i, data);
                }
                if (data[i].children) {
                    loop(data[i].children, key, callback);
                }
            }
        };
        const data = [...this.state.menuItems];

        // Find dragObject
        let dragObj;
        let index0
        let arr0
        loop(data, dragKey, (item, index, arr) => {
            index0 = index
            arr0 = arr
            dragObj = item;
        });

        if (!info.dropToGap && dragObj.children.length > 0) {
            notification['error']({
                message: "Error",
                description: this.props.intl.formatMessage({id: "error.cantMove"}),
                duration: 5
            });
            return
        }
        arr0.splice(index0, 1);

        if (!info.dropToGap) {
            // Drop on the content
            loop(data, dropKey, item => {
                if (item.level === 1) {
                    item.children = item.children || [];
                    dragObj.level = 2
                    // where to insert 示例添加到尾部，可以是随意位置
                    item.children.push(dragObj);
                } else {
                    for (let i = 0; i < data.length; i++) {
                        for (let j = 0; j < data[i].children.length; j++) {
                            if (data[i].children[j].key == dropKey) {
                                dragObj.level = 2
                                data[i].children.splice(j + 1, 0, dragObj)
                            }
                        }
                    }
                }
            });
        } else if (
            (info.node.props.children || []).length > 0 && // Has children
            info.node.props.expanded && // Is expanded
            dropPosition === 1 // On the bottom gap
        ) {
            loop(data, dropKey, item => {
                item.children = item.children || [];
                // where to insert 示例添加到头部，可以是随意位置
                item.children.unshift(dragObj);
            });
        } else {
            let ar;
            let i;
            let level;
            loop(data, dropKey, (item, index, arr) => {
                level = item.level
                ar = arr;
                i = index;
            });

            dragObj.level = level
            if (dropPosition === -1) {
                ar.splice(i, 0, dragObj);
            } else {
                ar.splice(i + 1, 0, dragObj);
            }
        }

        this.setState({
            menuItems: data,
        });

        this.props.onChange(data)
    };

    // onDragStart(e) {
    //     this.state.menuItems.forEach((node) => {
    //         if (e.node.level == 2) {
    //             return 
    //         }

    //         if (node.level !== e.node.level) {
    //             node.disabled = true
    //         }
    //         if (node.children) {
    //             node.children.forEach((child) => {
    //                 if (child.level !== e.node.level) {
    //                     child.disabled = true
    //                 }
    //             })
    //         }
    //     })
    // }
    // onDragEnd(e) {
    //     this.state.menuItems.forEach((node) => {
    //         if (node.level !== e.node.level) {
    //             node.disabled = false
    //         }
    //         if (node.children) {
    //             node.children.forEach((child) => {
    //                 if (child.level !== e.node.level) {
    //                     child.disabled = false
    //                 }
    //             })
    //         }
    //     })
    // }
    onNodeSelect(e) {
        const { node } = e
        this.setState({
            ...this.state,
            drawerVisible: true,
            selectedNode: node
        })
    }

    onCancelDrawer() {
        this.setState({ ...this.state, drawerVisible: false, selectedNode: null })
    }

    isMenuValid(v:MenuItem, menuItems) {
        if (v.text == undefined || v.text.trim() == '') {
            notification['error']({
                message: "Error",
                description: this.props.intl.formatMessage({id: "error.menuNameEmpty"}),
                duration: 5
            });
            return false
        }
        v.text = v.text.trim()

        if (v.url == undefined || v.url.trim() == '') {
            notification['error']({
                message: "Error",
                description:this.props.intl.formatMessage({id: "error.menuUrlEmpty"})  ,
                duration: 5
            });
            return false
        }
        v.url = v.url.trim()

        if (!_.startsWith(v.url, '/')) {
            notification['error']({
                message: "Error",
                description: this.props.intl.formatMessage({id: "error.menuUrlPrefixInvalid"}),
                duration: 5
            });
            return false
        }

        let count = 0
        for (let i = 0; i < v.url.length; i++) {
            const alpha = v.url[i]
            if (alpha == '/') {
                count++
                continue
            }

            if (!(alpha >= 'a' && alpha <= 'z') && !(alpha >= 'A' && alpha <= 'Z')) {
                notification['error']({
                    message: "Error",
                    description: this.props.intl.formatMessage({id: "error.menuUrlCharInvalid"}) ,
                    duration: 5
                });
                return false
            }
        }
        if (count > 1) {
            notification['error']({
                message: "Error",
                description: this.props.intl.formatMessage({id: "error.menuUrlOnlyOnePrefix"}),
                duration: 5
            });
            return false
        }

        // url mustn't conflict with fix routes
        for (let i = 0; i < reservedUrls.length; i++) {
            if (v.url === reservedUrls[i]) {
                notification['error']({
                    message: "Error",
                    description: this.props.intl.formatMessage({id: "error.menuUrlReserved"}),
                    duration: 5
                });
                return false
            }
        }
        
        // if (v.id === undefined || v.id.trim() === '') {
        //     notification['error']({
        //         message: "Error",
        //         description: this.props.intl.formatMessage({id: "error.menuDashUidEmpty"}),
        //         duration: 5
        //     });
        //     return false
        // }
        if  (v.id) {
            v.id = v.id.trim()
        }
        
        if (v.icon === undefined || v.icon.trim() === '') {
            notification['error']({
                message: "Error",
                description: this.props.intl.formatMessage({id: "error.menuIconEmpty"}),
                duration: 5
            });
            return false
        }
        v.icon = v.icon.trim()

        return true
    }
    async addMenuItem(v) {
        const { selectedNode, menuItems } = this.state
        if (!this.isMenuValid(v, menuItems)) {
            return
        }

        // const [i, j] = findSelectedNode(v.id, menuItems)
        // if (i !== -1) {
        //     notification['error']({
        //         message: "Error",
        //         description: localeData[getState().application.locale]['error.menuDashUidExist'] + ` ${menuItems[i].title}  ${j !== -1 ? ' -> ' + menuItems[i].children[j].title : ''}`,
        //         duration: 5
        //     });
        //     return
        // }

        if (selectedNode.level === 2 && v.position === 2) {
            notification['error']({
                message: "Error",
                description: this.props.intl.formatMessage({id: "error.menuChildHasChild"}),
                duration: 5
            });
            return
        }

        // the same url cant be exist in the same level
        {
            if (selectedNode.level === 1 && v.position === 1) {
                for (let i = 0; i < menuItems.length; i++) {
                    if (menuItems[i].url === v.url) {
                        notification['error']({
                            message: "Error",
                            description: localeData[getState().application.locale]['error.menuSameUrlExist'] + ` ${menuItems[i].text}`,
                            duration: 5
                        });
                        return
                    }
                }
            }

            if (selectedNode.level === 1 && v.position === 2) {
                for (let i = 0; i < selectedNode.children.length; i++) {
                    if (selectedNode.children[i].url === v.url) {
                        notification['error']({
                            message: "Error",
                            description: localeData[getState().application.locale]['error.menuSameUrlExist'] + `${selectedNode.text} -> ${selectedNode.children[i].text}`,
                            duration: 5
                        });
                        return
                    }
                }
            }

            if (selectedNode.level === 2 && v.position === 1) {
                const [i, j] = findSelectedNode(selectedNode.id, menuItems)
                const item = menuItems[i]
                for (let i = 0; i < item.children.length; i++) {
                    if (item.children[i].url === v.url) {
                        notification['error']({
                            message: "Error",
                            description: localeData[getState().application.locale]['error.menuSameUrlExist'] + ` ${item.text} -> ${item.children[i].text}`,
                            duration: 5
                        });
                        return
                    }
                }
            }
        }

        try {
            if (v.id) {
                const res = await getBackendSrv().get(`/api/dashboard/uid/${v.id}`)
            }

            const [i, j] = findSelectedNode(selectedNode.id, menuItems)
            const item = menuItems[i]
            if (v.position === 1) {
                menuItems.splice(i + 1, 0, {
                    id: v.id,
                    url: v.url,
                    key: v.id,
                    level: item.level,
                    text: v.text,
                    icon: v.icon
                })
            } else {
                item.children.push({
                    id: v.id,
                    url: v.url,
                    key: v.id,
                    level: item.level + 1,
                    icon: v.icon,
                    text: v.text
                })
            }

            this.props.onChange(menuItems)
            this.setState({
                ...this.state,
                drawerVisible: false,
                selectedNode: null
            })
        } catch (error) {
            if (error.status === 404) {
                notification['error']({
                    message: "Error",
                    description: this.props.intl.formatMessage({id: "error.menuDashNotExist"}),
                    duration: 5
                });
            }
        }
    }

    updateMenuItem(v: MenuItem) {
        const { selectedNode, menuItems } = this.state
        if (!this.isMenuValid(v, menuItems)) {
            return
        }

        // check if the same dashboard uid exists
        // {
        //     for (let i = 0; i < menuItems.length; i++) {
        //         if (menuItems[i].id !== selectedNode.id) {
        //             if (menuItems[i].id === v.id) {
        //                 notification['error']({
        //                     message: "Error",
        //                     description: localeData[getState().application.locale]['error.menuDashUidExist'] + ` ${menuItems[i].title}`,
        //                     duration: 5
        //                 });
        //                 return
        //             }
        //         }


        //         for (let j = 0; j < menuItems[i].children.length; j++) {
        //             const child = menuItems[i].children[j]
        //             if (child.id !== selectedNode.id) {
        //                 if (child.id === v.id) {
        //                     notification['error']({
        //                         message: "Error",
        //                         description: localeData[getState().application.locale]['error.menuDashUidExist'] + ` ${menuItems[i].title} -> ${menuItems[i].children[j].title}`,
        //                         duration: 5
        //                     });
        //                     return
        //                 }
        //             }
        //         }
        //     }
        // }

        // check if the same url exists
        {
            if (selectedNode.level === 1) {
                for (let i = 0; i < menuItems.length; i++) {
                    if (menuItems[i].id !== selectedNode.id) {
                        if (menuItems[i].url === v.url) {
                            notification['error']({
                                message: "Error",
                                description: localeData[getState().application.locale]['error.menuSameUrlExist']  + ` ${menuItems[i].text}`,
                                duration: 5
                            });
                            return
                        }
                    }
                }
            } else {
                const [i, j] = findSelectedNode(selectedNode.id, menuItems)
                const item = menuItems[i]
                for (let i = 0; i < item.children.length; i++) {
                    if (item.children[i].id !== selectedNode.id) {
                        if (item.children[i].url === v.url) {
                            notification['error']({
                                message: "Error",
                                description: localeData[getState().application.locale]['error.menuSameUrlExist']  + ` ${item.text} -> ${item.children[i].text}`,
                                duration: 5
                            });
                            return
                        }
                    }
                }
            }
        }
        const newMenuItems = _.cloneDeep(menuItems)

        const [i, j] = findSelectedNode(selectedNode.id, newMenuItems)
        let item: MenuItem
        if (j === -1) {
            item = newMenuItems[i]
        } else {
            item = newMenuItems[i].children[j]
        }

        item.id = v.id
        item.text = v.text
        item.url = v.url
        item.icon = v.icon

        this.setState({
            ...this.state,
            menuItems: newMenuItems
        })

        this.onCancelDrawer()
        this.props.onChange(newMenuItems)
    }

    deleteMenuItem(selectedNode: MenuItem) {
        let menuItems = _.cloneDeep(this.state.menuItems)

        const [i, j] = findSelectedNode(selectedNode.id, menuItems)
        if (j === -1) {
            if (menuItems.length === 1) {
                notification['error']({
                    message: "Error",
                    description: this.props.intl.formatMessage({id: "error.menuCannotBeEmpty"}),
                    duration: 5
                })
                return
            }
            _.pullAt(menuItems, i)
        } else {
            _.pullAt(menuItems[i].children, j)
        }

        this.setState({
            ...this.state,
            menuItems: menuItems
        })

        this.onCancelDrawer()
        this.props.onChange(menuItems)
    }

    render() {
        const { drawerVisible, selectedNode, menuItems } = this.state
        for (const mi of menuItems) {
            //@ts-ignore 
            mi.title = mi.text
            for (const mic of mi.children) {
                //@ts-ignore
                mic.title = mic.text
            }
        }

        console.log(menuItems)
        return (
            <>
                <Tree
                    style={{ padding: '5px' }}
                    blockNode
                    className="draggable-tree"
                    draggable
                    // onDragStart={this.onDragStart}
                    onDrop={this.onDrop}
                    // onDragEnd={this.onDragEnd}
                    //@ts-ignore
                    treeData={menuItems}
                    defaultExpandAll
                    showLine={false}
                    // switcherIcon={<DownOutlined />}
                    onSelect={(_, e) => this.onNodeSelect(e)}
                />
                {selectedNode && <AddMenuItem drawerVisible={drawerVisible} selectedNode={selectedNode} onChange={(v) => this.addMenuItem(v)} onCancelDrawer={() => this.onCancelDrawer()} />}
                {selectedNode && <ManageMenuItem drawerVisible={drawerVisible} selectedNode={selectedNode} onChange={(v) => this.updateMenuItem(v)} onCancelDrawer={() => this.onCancelDrawer()} onDelete={(v) => this.deleteMenuItem(v)} />}

            </>
        );
    }
}

function findSelectedNode(id: string, nodes: MenuItem[]) {
    let i = -1
    let j = -1
    for (let m = 0; m < nodes.length; m++) {
        const item = nodes[m]
        if (item.id === id) {
            i = m
            break
        }
        if (item.children) {
            for (let n = 0; n < item.children.length; n++) {
                const child = item.children[n]
                if (child.id === id) {
                    i = m
                    j = n
                    break
                }
            }
        }
    }

    return [i, j]
}

export default injectIntl(MenuMange)



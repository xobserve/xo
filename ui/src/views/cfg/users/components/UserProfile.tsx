import React, { PureComponent, FC } from 'react';
import _ from 'lodash'
import { UserState } from 'src/store/reducers/user'
import { cx, css } from 'emotion';
import { ConfirmButton, ConfirmModal, LegacyInputStatus, Button, stylesFactory, Input, DatavTheme, currentTheme, getTheme,RadioButtonGroup } from 'src/packages/datav-core/src';
import { Role } from 'src/types';
import { getBackendSrv } from 'src/core/services/backend';
import { notification } from 'antd';
import isEmail from 'validator/lib/isEmail';
import RolePicker from 'src/views/components/Pickers/RolePicker'
import { injectIntl,FormattedMessage, IntlShape } from 'react-intl';

interface Props {
    user: UserState;
    onUserDelete: any
    reloadUsers: any
}

interface IntlProps {
    intl: IntlShape
}

interface State {
    tempUser: UserState;
    isLoading: boolean;
    showDeleteModal: boolean;
    showDisableModal: boolean;
}


class UserProfile extends PureComponent<Props & IntlProps, State> {
    state = {
        isLoading: false,
        showDeleteModal: false,
        showDisableModal: false,
        tempUser: _.cloneDeep(this.props.user)
    };

    showDeleteUserModal = (show: boolean) => () => {
        this.setState({ showDeleteModal: show });
    };

    showDisableUserModal = (show: boolean) => () => {
        this.setState({ showDisableModal: show });
    };

    onUserDelete = () => {
        const { user } = this.props;
        this.props.onUserDelete(user)
        this.setState({ showDeleteModal: false })
    };

    onUserDisable = () => {
        // const { user, onUserDisable } = this.props;
        // onUserDisable(user.id);
    };

    onUserEnable = () => {
        // const { user, onUserEnable } = this.props;
        // onUserEnable(user.id);
    };


    onChangeSetUser = (key,tempUser) => {
        getBackendSrv().put(`/api/admin/user/${tempUser.id}`,tempUser).then(() => {
            this.props.reloadUsers()

            notification['success']({
                message: "Success",
                description: this.props.intl.formatMessage({id: "info.targetUpdated"}),
                duration: 5
            });
        }).catch(() => {
            this.setState({
                ...this.state,
                tempUser: _.cloneDeep(this.props.user)
            })
        })
    }
    onUserNameChange = (name: string) => {
        const tempUser = {
            ...this.state.tempUser,
            name: name
        } 
        this.setState({
            ...this.state,
            tempUser:tempUser
        })
        this.onChangeSetUser('name',tempUser)
    };

    onUserUsernameChange = (username:string) => {
        const tempUser = {
            ...this.state.tempUser,
            username: username
        } 
        this.setState({
            ...this.state,
            tempUser:tempUser
        })
        this.onChangeSetUser('username',tempUser)
    }
    onUserEmailChange = (email: string) => {
        if (!isEmail(email)) {
            notification['error']({
                message: "Error",
                description: this.props.intl.formatMessage({id: "info.emailFormat"}),
                duration: 5
            });
            return 
        }
        const tempUser = {
            ...this.state.tempUser,
            email: email
        } 
        this.setState({
            ...this.state,
            tempUser:tempUser
        })
        this.onChangeSetUser('email',tempUser)
    };

    onRoleChange = (role: string) => {
        const tempUser = {
            ...this.state.tempUser,
            role: role as Role
        } 
        this.setState({
            ...this.state,
            tempUser:tempUser
        })
        this.onChangeSetUser('role',tempUser)
    }

    onPasswordChange = (password: string) => {
        const {user} = this.props
        getBackendSrv().put(`/api/admin/password`,{id: user.id.toString(),password: password}).then(() => {
            this.props.reloadUsers()

            notification['success']({
                message: "Success",
                description: this.props.intl.formatMessage({id: "info.targetUpdated"}),
                duration: 5
            });
        })
    };

    render() {
        const { showDeleteModal, showDisableModal,tempUser } = this.state;
        const styles = getStyles(getTheme(currentTheme));

        return (
            <>
                <h3 className="page-heading"><FormattedMessage id="user.information"/></h3>
                <div className="gf-form-group">
                    <div className="gf-form">
                        <table className="filter-table form-inline">
                            <tbody>
                                <UserProfileRow
                                    label="Username"
                                    value={tempUser.username}
                                    onChange={this.onUserUsernameChange}
                                />
                                <UserProfileRow
                                    label="Name"
                                    value={tempUser.name}
                                    onChange={this.onUserNameChange}
                                />
                                <UserProfileRow
                                    label="Email"
                                    value={tempUser.email}
                                    onChange={this.onUserEmailChange}
                                />
                                <UserProfileRow
                                    label="Password"
                                    value="********"
                                    inputType="password"
                                    onChange={this.onPasswordChange}
                                />
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.buttonRow}>
                        <Button variant="destructive" onClick={this.showDeleteUserModal(true)}>
                            Delete User
                        </Button>
                        <ConfirmModal
                            isOpen={showDeleteModal}
                            title="Delete user"
                            body="Are you sure you want to delete this user?"
                            confirmText="Delete user"
                            onConfirm={this.onUserDelete}
                            onDismiss={this.showDeleteUserModal(false)}
                        />
                        {tempUser.isDisabled ? (
                            <Button variant="secondary" onClick={this.onUserEnable}>
                                Enable User
                            </Button>
                        ) : (
                                <Button variant="secondary" onClick={this.showDisableUserModal(true)}>
                                    Disable User
                                </Button>
                            )}
                        <ConfirmModal
                            isOpen={showDisableModal}
                            title="Disable user"
                            body="Are you sure you want to disable this user?"
                            confirmText="Disable user"
                            onConfirm={this.onUserDisable}
                            onDismiss={this.showDisableUserModal(false)}
                        />
                    </div>
                </div>

                <h3 className="page-heading">User Permissions</h3>
                <div className="gf-form-group">
                    <div className="gf-form">
                        <table className="filter-table form-inline">
                            <tbody>
                                <tr>
                                <td className="width-16" style={{fontWeight: 500}}>Global Role</td>
                                <td className="width-25" colSpan={2}>
                                    <RolePicker onChange={this.onRoleChange} value={tempUser.role}/>
                                </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        );
    }
}

export default injectIntl(UserProfile)

const getStyles = stylesFactory((theme: DatavTheme) => {
    return {
        buttonRow: css`
      margin-top: 0.8rem;
      > * {
        margin-right: 16px;
      }
    `,
    };
});

interface UserProfileRowProps {
    label: string;
    value?: string;
    locked?: boolean;
    lockMessage?: string;
    inputType?: string;
    onChange?: (value: string) => void;
}

interface UserProfileRowState {
    value: string;
    editing: boolean;
}

export class UserProfileRow extends PureComponent<UserProfileRowProps, UserProfileRowState> {
    inputElem: HTMLInputElement;
    
    constructor(props) {
        super(props)
        this.state = {
            editing: false,
            value: this.props.value || '',
        };
    }

    static defaultProps: Partial<UserProfileRowProps> = {
        value: '',
        locked: false,
        lockMessage: '',
        inputType: 'text',
    };


   

    setInputElem = (elem: any) => {
        this.inputElem = elem;
    };

    onEditClick = () => {
        if (this.props.inputType === 'password') {
            // Reset value for password field
            this.setState({ editing: true, value: '' }, this.focusInput);
        } else {
            this.setState({ editing: true }, this.focusInput);
        }
    };

    onCancelClick = () => {
        this.setState({ editing: false, value: this.props.value || '' });
    };

    onInputChange = (event: React.ChangeEvent<HTMLInputElement>, status?: LegacyInputStatus) => {
        if (status === LegacyInputStatus.Invalid) {
            return;
        }

        this.setState({ value: event.target.value });
    };

    onInputBlur = (event: React.FocusEvent<HTMLInputElement>, status?: LegacyInputStatus) => {
        if (status === LegacyInputStatus.Invalid) {
            return;
        }

        this.setState({ value: event.target.value });
    };

    focusInput = () => {
        if (this.inputElem && this.inputElem.focus) {
            this.inputElem.focus();
        }
    };

    onSave = () => {
        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }
        this.setState({
            ...this.state,
            editing: false,
        })
    };

    render() {
        const { label, locked, lockMessage, inputType } = this.props;
        const { value } = this.state;
        const labelClass = cx(
            'width-16',
            css`
        font-weight: 500;
      `
        );
        const editButtonContainerClass = cx('pull-right');

        if (locked) {
            return <LockedRow label={label} value={value} lockMessage={lockMessage} />;
        }

        return (
            <tr>
                <td className={labelClass}>{label}</td>
                <td className="width-25" colSpan={2}>
                    {this.state.editing ? (
                        <Input
                            type={inputType}
                            defaultValue={value}
                            onBlur={this.onInputBlur}
                            onChange={this.onInputChange}
                            ref={this.setInputElem}
                            width={30}
                        />
                    ) : (
                            <span>{this.props.value}</span>
                        )}
                </td>
                <td>
                    <div className={editButtonContainerClass}>
                        <ConfirmButton
                            confirmText="Save"
                            onClick={this.onEditClick}
                            onConfirm={this.onSave}
                            onCancel={this.onCancelClick}
                            closeOnConfirm
                        >
                            Edit
                        </ConfirmButton>
                    </div>
                </td>
            </tr>
        );
    }
}

interface LockedRowProps {
    label: string;
    value?: any;
    lockMessage?: string;
}

export const LockedRow: FC<LockedRowProps> = ({ label, value, lockMessage }) => {
    const lockMessageClass = cx(
        'pull-right',
        css`
      font-style: italic;
      margin-right: 0.6rem;
    `
    );
    const labelClass = cx(
        'width-16',
        css`
      font-weight: 500;
    `
    );

    return (
        <tr>
            <td className={labelClass}>{label}</td>
            <td className="width-25" colSpan={2}>
                {value}
            </td>
            <td>
                <span className={lockMessageClass}>{lockMessage}</span>
            </td>
        </tr>
    );
};

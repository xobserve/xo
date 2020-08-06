import appEvents from 'src/core/library/utils/app_events';
import { message } from 'antd'


function init() {
    // global show message events
    // appEvents.on('show-datasource-delete-message', () => {
    //     message.success("Data source deleted!")
    // })
}

function showMessage(sender: () => any) {
    setTimeout(() => sender(),100)
}

export default {
    init,
    showMessage
}
import React from 'react'
import './PreloadError.less'

interface Props { }

const PreloadError = (props: Props) => {
    return (
        <div className="preloader">
            <div className="preloader__text preloader__text--fail">
                <p>
                    <strong>If you're seeing this, maybe we has failed to connect to backend server</strong>
                    <br />
                    <br />
                </p>
                <p>
                    1. This could be caused by your reverse proxy settings.<br /><br />
          2. Checkout and make sure the datav server is running.<br />
                    <br />
          3. Sometimes restarting datav can help<br />
                </p>
            </div>
        </div>
    )
}



export default PreloadError
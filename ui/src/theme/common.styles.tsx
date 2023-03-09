import { Global, css } from "@emotion/react"

const CommonStyles = () => (
  <Global
    styles={(theme: any) => css` 
      .infinite-scroller {
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }   
      }
      
      .top-gradient-border {
        ::before {
          display: block;
          content:' ';
          position: relative;
          height: 2px;
      
          background-image: linear-gradient(to right,#33a2e5 30%,#52c41a 99%)
        }
      }
    `}
  />
)

export default CommonStyles

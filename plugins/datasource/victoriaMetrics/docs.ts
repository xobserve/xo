const getDocs = () => {
    return ([{
        tab: "Docs1",
        content: docs1
    },{
        tab: "Docs2",
        content: docs2
    }])
}

export default getDocs


const docs1 = `
# Hello VM docs1
\`\`\`go
func main () {
    
}
\`\`\`
`

const docs2 = `
# Hello VM docs2
\`\`\`go
func main () {
    
}
\`\`\`
`
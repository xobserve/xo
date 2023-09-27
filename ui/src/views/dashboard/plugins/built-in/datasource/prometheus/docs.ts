const getPrometheusDocs = () => {
    return ([{
        tab: "Docs1",
        content: docs1
    },{
        tab: "Docs2",
        content: docs2
    }])
}

export default getPrometheusDocs


const docs1 = `
# Hello prometheus docs1
\`\`\`go
func main () {
    
}
\`\`\`
`

const docs2 = `
# Hello prometheus docs2
\`\`\`go
func main () {
    
}
\`\`\`
`
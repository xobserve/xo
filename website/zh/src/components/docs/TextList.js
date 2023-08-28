const TextList = ({ children }) => {
    return <ol role="list" className="marker:text-sky-400 list-disc pl-5 space-y-3" style={{

    }}>
     {children}
  </ol>
}

export default TextList
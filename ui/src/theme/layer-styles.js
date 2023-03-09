export default function layerStyles(theme) {
    return {
        textSecondary: {
          opacity: "0.8",
        },
        textThird: {
          opacity: "0.7",
        },
        colorButton: {
          // linear-gradient(270deg,#0076f5,#0098a3)
          bgGradient: "radial(yellow.400, pink.200)",
          color: "white",
          _hover: {
            cursor: 'pointer'
          },
          _focus: null
        },
        cardHeader: {
          px: "4",
          py: "3",
          justifyContent:"space-between",
          alignItems:"center"
        },
        gradientText: {
          backgroundClip: "text",
          color: "transparent" ,
          backgroundImage: "linear-gradient(to right bottom, rgb(52, 102, 246), rgb(124, 188, 237))"
        },
        gradientBg: {
          bg: "linear-gradient(to right bottom, rgb(52, 102, 246), rgb(124, 58, 237))"
        },
      }
}
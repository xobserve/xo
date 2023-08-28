import { IconContainer, Caption, BigText, Paragraph, Link, Widont } from '@/components/home/common'
import { useInView } from 'react-intersection-observer'


const w = 1213
const h = 675



export function ReadyMadeComponents() {
  const { ref: inViewRef, inView } = useInView({ threshold: 0.5, triggerOnce: true })

  return (
    <section id="ready-made-components">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <IconContainer
          className="dark:bg-indigo-500 dark:highlight-white/20"
          light={require('@/img/icons/home/ready-made-components.png').default.src}
          dark={require('@/img/icons/home/dark/ready-made-components.png').default.src}
        />
        <Caption className="text-indigo-500">Ready-made components</Caption>
        <BigText>
          <Widont>Move even faster with Tailwind UI.</Widont>
        </BigText>
        <Paragraph>
          Tailwind UI is a collection of beautiful, fully responsive UI components, designed and
          developed by us, the creators of Tailwind CSS. It's got hundreds of ready-to-use examples
          to choose from, and is guaranteed to help you find the perfect starting point for what you
          want to build.
        </Paragraph>
        <Link href="https://tailwindui.com/?ref=landing" color="indigo" darkColor="gray">
          Learn more
        </Link>
      </div>
    </section>
  )
}

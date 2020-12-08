import { useEffect, useState } from 'react'
import { motion, useTransform, animate, useMotionValue } from 'framer-motion'
import { gradients } from '@/utils/gradients'
import { useInView } from 'react-intersection-observer'

const colors = {
  lightblue: [gradients.lightblue[0], 'text-cyan-100', 'bg-cyan-100'],
  purple: [gradients.purple[0], 'text-fuchsia-100', 'bg-fuchsia-100'],
  orange: [gradients.orange[0], 'text-orange-100', 'bg-orange-100'],
  teal: [gradients.teal[0], 'text-green-100', 'bg-green-100'],
  violet: [gradients.violet[0], 'text-purple-100', 'bg-purple-100'],
  amber: [gradients.amber[0], 'text-orange-100', 'bg-orange-100'],
  pink: [gradients.pink[0], 'text-rose-100', 'bg-rose-100'],
  blue: [gradients.blue[0], 'text-light-blue-100', 'bg-light-blue-100'],
}

const rotation = [-2, 1, -1, 2, -1, 1]



function Testimonial({ testimonial, base, index, total }) {
  const x = useTransform(
    base,
    [0, (100 / total) * (index + 1), (100 / total) * (index + 1), 100],
    ['0%', `${(index + 1) * -100}%`, `${total * 100 - (index + 1) * 100}%`, '0%']
  )
  const [straight, setStraight] = useState(false)

  const color = colors[Object.keys(colors)[index % Object.keys(colors).length]]

  return (
    <motion.li
      className="px-3 md:px-4 flex-none"
      onMouseEnter={() => setStraight(true)}
      onMouseLeave={() => setStraight(false)}
      style={{ x }}
    >
      <motion.figure
        className="shadow-lg rounded-xl flex-none w-80 md:w-xl"
        initial={false}
        animate={straight ? { rotate: 0 } : { rotate: rotation[index % rotation.length] }}
      >
        <blockquote className="rounded-t-xl bg-white px-6 py-8 md:p-10 text-lg md:text-xl leading-8 md:leading-8 font-semibold text-gray-900">
          <svg width="45" height="36" className={`mb-5 fill-current ${color[1]}`}>
            <path d="M13.415.001C6.07 5.185.887 13.681.887 23.041c0 7.632 4.608 12.096 9.936 12.096 5.04 0 8.784-4.032 8.784-8.784 0-4.752-3.312-8.208-7.632-8.208-.864 0-2.016.144-2.304.288.72-4.896 5.328-10.656 9.936-13.536L13.415.001zm24.768 0c-7.2 5.184-12.384 13.68-12.384 23.04 0 7.632 4.608 12.096 9.936 12.096 4.896 0 8.784-4.032 8.784-8.784 0-4.752-3.456-8.208-7.776-8.208-.864 0-1.872.144-2.16.288.72-4.896 5.184-10.656 9.792-13.536L38.183.001z" />
          </svg>
          {typeof testimonial.content === 'string' ? (
            <p>{testimonial.content}</p>
          ) : (
            testimonial.content
          )}
        </blockquote>
        <figcaption
          className={`flex items-center space-x-4 p-6 md:px-10 md:py-6 bg-gradient-to-br rounded-b-xl leading-6 font-semibold text-white ${color[0]}`}
        >
          <div className="flex-none w-14 h-14 bg-white rounded-full flex items-center justify-center">
            <img
              src={testimonial.author.avatar}
              alt=""
              className={`w-12 h-12 rounded-full ${color[2]}`}
              loading="lazy"
            />
          </div>
          <div className="flex-auto">
            {testimonial.author.name}
            {testimonial.author.role && (
              <>
                <br />
                <span className={color[1]}>{testimonial.author.role}</span>
              </>
            )}
          </div>
          {testimonial.tweetUrl && (
            <cite className="flex">
              <a
                href={testimonial.tweetUrl}
                className="opacity-50 hover:opacity-75 transition-opacity duration-200"
              >
                <span className="sr-only">Original tweet by {testimonial.author.name}</span>
                <svg width="33" height="32" fill="currentColor">
                  <path d="M32.411 6.584c-1.113.493-2.309.826-3.566.977a6.228 6.228 0 002.73-3.437 12.4 12.4 0 01-3.944 1.506 6.212 6.212 0 00-10.744 4.253c0 .486.056.958.16 1.414a17.638 17.638 0 01-12.802-6.49 6.208 6.208 0 00-.84 3.122 6.212 6.212 0 002.762 5.17 6.197 6.197 0 01-2.813-.777v.08c0 3.01 2.14 5.52 4.983 6.091a6.258 6.258 0 01-2.806.107 6.215 6.215 0 005.803 4.312 12.464 12.464 0 01-7.715 2.66c-.501 0-.996-.03-1.482-.087a17.566 17.566 0 009.52 2.79c11.426 0 17.673-9.463 17.673-17.671 0-.267-.007-.536-.019-.803a12.627 12.627 0 003.098-3.213l.002-.004z" />
                </svg>
              </a>
            </cite>
          )}
        </figcaption>
      </motion.figure>
    </motion.li>
  )
}

export function Testimonials({isChinese} = props) {
  const testimonials = [
    {
      content: isChinese===true ? `虽然我没有编程经验，但是使用Datav我依然能够轻松地创建想要的图表` : `I have no coding skills and with Datav I can actually make good looking dashboards with ease and it's everything I ever wanted`,
      author: {
        name: 'Sara Vieira',
        role: 'Data Engineer',
        avatar: require('@/img/avatars/sara-vieira.jpg').default,
      },
    },
    {
      content: isChinese===true ? '如果让我推荐现在的监控平台怎么搭建，我会推荐jaeger + prometheus + datav' :'If I had to recommend a way of getting into apm today, it would be jaeger + prometheus + datav',
      tweetUrl: '',
      author: {
        name: 'Guillermo Rauch',
        role: 'APM Developer',
        avatar: require('@/img/avatars/guillermo-rauch.jpg').default,
      },
    },
    {
      content: isChinese===true ? '当我第一次看到datav项目时，就立刻看到了它的潜力，联系Michal Sopor加入Datav团队，并成为核心贡献者' :'When I first saw datav, I instantly contact Michal Sopor to join datav team, and finally become a core contributor of datav',
      tweetUrl: '',
      author: {
        name: 'Sunface',
        role: 'Datav Core Contributor',
        avatar: require('@/img/avatars/sunface.jpg').default,
      },
    },
    {
      content: isChinese===true ? `我刚开始用Datav不久，但是很快就爱上了它的漂亮的设计、完善的文档以及简单好用的仪表盘` :`I started using datav. I instantly fell in love with their beautiful design, thorough documentation, and how easy it was customizing my dashboards.`,
      tweetUrl: '',
      author: {
        name: 'Dacey Nolan',
        role: 'Software Engineer',
        avatar: require('@/img/avatars/dacey-nolan.jpg').default,
      },
    },
  
    {
      content: isChinese===true ? '使用Datav的每时每刻我都很享受' :'Loved it the very moment I used it.',
      author: {
        name: 'Gilbert Rabut Tsurwa',
        role: 'Devops Engineer',
        avatar: require('@/img/avatars/gilbert-rabut-tsurwa.jpg').default,
      },
    },
  
    {
      content:
      isChinese===true ? '我一直在寻找企业级的图形可视化解决访问，Datav就是我最终的答案' :"I'm looking for a more enterprise-ready data visualization solutions, I find it now",
      tweetUrl: '',
      author: {
        name: 'Madeline Campbell',
        role: 'Full-Stack Developer',
        avatar: require('@/img/avatars/madeline-campbell.jpg').default,
      },
    },
  
    {
      content:
      isChinese===true ? 'Datav有一点真的很讨厌 - 一旦你用了它，就再也无法离开' :'There’s one thing that sucks about datav - once you’ve used it you cant leave it',
      tweetUrl: '',
      author: {
        name: 'Graeme Houston',
        role: 'Devops Engineer',
        avatar: require('@/img/avatars/graeme-houston.jpg').default,
      },
    },
  ]

  const x = useMotionValue(0)
  const { inView, ref: inViewRef } = useInView({ threshold: 0, rootMargin: '100px' })
  const [duration, setDuration] = useState(150)

  useEffect(() => {
    if (!inView) return

    const controls = animate(x, 100, {
      type: 'tween',
      duration,
      ease: 'linear',
      loop: Infinity,
    })

    return controls.stop
  }, [inView, x, duration])

  return (
    <div
      ref={inViewRef}
      className="relative"
      onMouseEnter={() => setDuration(250)}
      onMouseLeave={() => setDuration(150)}
      style={{marginTop:"80px"}}
    >
      <div
        className="absolute right-0 bottom-1/2 left-0 bg-gradient-to-t from-gray-100 pointer-events-none"
        style={{ height: 607, maxHeight: '50vh' }}
      />
      <div className="flex overflow-hidden -my-8">
        <ul className="flex items-center w-full py-8">
          {testimonials.map((testimonial, i) => (
            <Testimonial
              key={i}
              testimonial={testimonial}
              base={x}
              index={i}
              total={testimonials.length}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

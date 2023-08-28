import { SidebarLayout } from '@/layouts/SidebarLayout'
import { Title } from '@/components/Meta'
import { documentationNav } from '@/navs/documentation'

export function DocumentationLayout(props) {
  return (
    <>
      <Title>{props.layoutProps.meta.metaTitle || props.layoutProps.meta.title}</Title>
      <SidebarLayout nav={documentationNav} {...props} />
    </>
  )
}

DocumentationLayout.nav = documentationNav

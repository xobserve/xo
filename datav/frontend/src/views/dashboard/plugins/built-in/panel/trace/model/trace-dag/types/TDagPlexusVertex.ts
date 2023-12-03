// Copyright (c) 2019-2020 The Jaeger Authors.
//

import { TVertex } from '../../../components/plexus/lib/types'

import TDagNode from './TDagNode'

type TDagPlexusVertex<T extends { [k: string]: unknown } = {}> = TVertex<{
  data: TDagNode<T>
}>

// eslint-disable-next-line no-undef
export default TDagPlexusVertex

export const CHUNK_SIZE = 64 * 1024 // 64 KB

export async function* chunkFile(file: File): AsyncGenerator<{
  index: number
  data: ArrayBuffer
  total: number
}> {
  const total = Math.ceil(file.size / CHUNK_SIZE) || 1
  let offset = 0
  let index = 0
  while (offset < file.size) {
    const slice = file.slice(offset, Math.min(offset + CHUNK_SIZE, file.size))
    yield { index, data: await slice.arrayBuffer(), total }
    index++
    offset += CHUNK_SIZE
  }
}

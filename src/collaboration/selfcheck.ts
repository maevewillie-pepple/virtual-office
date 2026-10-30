import { OFFICE_DESIGNS } from '../data/officeMap'
import { buildRoomIndex, roomIdAt } from './rooms'
import { castVote, voteCounts, type DiscussionTopic } from './store'

const classic = OFFICE_DESIGNS.find(design => design.id === 'classic')!.build()
const rooms = buildRoomIndex(classic.tiles)
const boards = (classic.interactables ?? []).filter(obj => obj.type === 'use_whiteboard')
const meetings = (classic.interactables ?? []).filter(obj => obj.type === 'use_meeting')

const byRoom = new Map<string, number>()
for (const board of boards) {
  const room = roomIdAt(rooms, board.gridX, board.gridY)
  byRoom.set(room, (byRoom.get(room) ?? 0) + 1)
}
const shared = [...byRoom.values()].some(count => count > 1)
if (!shared) {
  console.error('expected multiple whiteboards in one room', [...byRoom.entries()])
  process.exit(1)
}

const meetingRoom = roomIdAt(rooms, meetings[0].gridX, meetings[0].gridY)
const meetingBoards = boards.filter(board => roomIdAt(rooms, board.gridX, board.gridY) === meetingRoom)
const other = boards.find(board => roomIdAt(rooms, board.gridX, board.gridY) !== meetingRoom)
if (meetingBoards.length < 2 || !other) {
  console.error('meeting room boards', meetingBoards.length, 'other', !!other)
  process.exit(1)
}

const topic: DiscussionTopic = {
  id: 't', officeId: 'o', roomId: 'r', authorId: 'a', authorName: 'A',
  title: 'Four-day week', description: '', category: 'debate', status: 'proposed',
  createdAt: '', votes: {},
}
const up = castVote(topic, 'b', 1)
if (voteCounts(up).up !== 1 || voteCounts(up).score !== 1) process.exit(1)
const down = castVote(up, 'b', -1)
if (voteCounts(down).up !== 0 || voteCounts(down).down !== 1) process.exit(1)
const cleared = castVote(down, 'b', -1)
if (voteCounts(cleared).down !== 0 || voteCounts(cleared).score !== 0) process.exit(1)

console.log(`rooms ok · ${meetingBoards.length} boards share ${meetingRoom} · votes replace`)

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="24"
        height="24"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        className="text-green-600 fill-current"
      >
        <path d="M8,0C4.134,0,1,3.134,1,7v9h2v-4c0-3.866,3.134-7,7-7h2c-3.866,0-7,3.134-7,7v2h3c3.866,0,7-3.134,7-7V0H8z" />
      </svg>
      <span className="text-xl font-bold text-gray-900">GardenX Admin</span>
    </div>
  )
}

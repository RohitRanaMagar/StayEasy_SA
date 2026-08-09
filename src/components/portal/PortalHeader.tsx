import { Link } from 'react-router-dom'
import logo1 from '../../assets/logo1.png'

interface PortalHeaderProps {
}

export default function PortalHeader({}: PortalHeaderProps) {
  return (
    <header className="portal-header">
      <div className="portal-header-left">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo1} alt="ServeIQ" className="h-[30px] w-auto" />
          <span style={{ fontFamily: "'Sora', 'Inter', sans-serif", fontWeight: 800, fontSize: "18px", color: "#1A3C5E" }}>
            Stay<span style={{ color: "#2E86AB" }}>Easy</span>
          </span>
        </Link>
      </div>
    </header>
  )
}

import { Link } from 'react-router-dom'
import { PageHeader } from '../components/common'
import { usePageTitle } from '../lib/hooks'

export default function NotFoundPage() {
  usePageTitle('Page not found')
  return (
    <PageHeader eyebrow="404" title="This stop isn’t on the network." lead="The page you were looking for doesn’t exist. Try one of these instead.">
      <div className="cluster" style={{ marginTop: 28 }}>
        <Link to="/" className="btn btn-primary">
          Company overview
        </Link>
        <Link to="/network" className="btn">
          Explore Network
        </Link>
        <Link to="/present/vision" className="btn">
          Start Investor Presentation
        </Link>
      </div>
    </PageHeader>
  )
}

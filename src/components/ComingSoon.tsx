import { Card, PageHeader } from './ui'

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="p-6">
        <Card>
          <p className="text-sm text-muted">{description}</p>
        </Card>
      </div>
    </>
  )
}
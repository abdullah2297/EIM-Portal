import { notFound } from 'next/navigation';
import { getCurrentEmployee, getTrainingDetail } from '@/lib/dataAccess';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge, StatusBadge, TagList } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { TrainingCard } from '@/components/cards/TrainingCard';
import { RegistrationPanel } from '@/components/training/RegistrationPanel';
import { ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/format';

/** @param {{ params: Promise<{ trainingId: string }> }} props */
export async function generateMetadata({ params }) {
  const { trainingId } = await params;
  const detail = await getTrainingDetail(trainingId);
  if (!detail) return { title: 'Training not found' };
  return { title: detail.training.name, description: detail.training.shortDescription };
}

/** `/learning/[trainingId]` - full training brief, agenda and instructor. */
export default async function TrainingDetailPage({ params }) {
  const { trainingId } = await params;
  const detail = await getTrainingDetail(trainingId);
  if (!detail) notFound();

  const { training, category, type, related, registeredCount, myRegistration } = detail;
  const me = await getCurrentEmployee();

  return (
    <>
      <PageHeader
        title={training.name}
        lead={training.shortDescription}
        breadcrumbs={[{ label: 'L&D', href: ROUTES.learning }, { label: training.name }]}
        actions={
          <Button href={ROUTES.learning} variant="on-dark" icon="ArrowBack">
            All training
          </Button>
        }
      >
        <div className="u-cluster u-cluster--sm">
          <StatusBadge status={training.status} pulse />
          {type ? <Badge tone="on-dark">{type.name}</Badge> : null}
          {category ? <Badge tone="on-dark">{category.name}</Badge> : null}
          {training.level ? (
            <Badge tone="on-dark" icon="Insights">
              {training.level}
            </Badge>
          ) : null}
          {training.certificateAvailable ? (
            <Badge tone="gold" icon="WorkspacePremium">
              Certificate available
            </Badge>
          ) : null}
        </div>
      </PageHeader>

      <section className="section section--tight">
        <div className="container-page grid-sidebar grid-sidebar--right">
          <div className="u-stack u-stack--lg">
            {/* Overview ------------------------------------------------------ */}
            <div className="card">
              <div className="card__media">
                <MediaPlaceholder src={training.image} alt={training.name} icon="MenuBook" />
              </div>
              <div className="card__body">
                <h2 className="card__title">About this training</h2>
                <div className="prose prose--wide">
                  {String(training.fullDescription || training.shortDescription || '')
                    .split('\n\n')
                    .filter(Boolean)
                    .map((paragraph) => (
                      <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                    ))}
                </div>
                {training.hostingType === 'External' && training.externalUrl ? (
                  <a
                    href={training.externalUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn btn--primary"
                  >
                    <Icon name="OpenInNew" fontSize="inherit" />
                    {training.status === 'Ongoing' ? 'Start Training' : 'Access Training'}
                  </a>
                ) : null}
              </div>
            </div>

            {/* What you will learn --------------------------------------------- */}
            {training.whatYouWillLearn?.length ? (
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="Lightbulb" />
                  What you will learn
                </h2>
                <ul className="icon-list">
                  {training.whatYouWillLearn.map((item) => (
                    <li className="icon-list__item" key={item}>
                      <span className="icon-list__bullet">
                        <Icon name="CheckCircle" fontSize="inherit" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ) : null}

            {/* Training content / agenda ---------------------------------------- */}
            {training.content?.length ? (
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="FactCheck" />
                  Training content
                </h2>
                <ol className="icon-list">
                  {training.content.map((module, index) => (
                    <li className="icon-list__item" key={module.title || index}>
                      <span className="icon-list__bullet">{index + 1}</span>
                      <span>
                        <strong>{module.title}</strong>
                        {module.description ? <span className="u-muted"> - {module.description}</span> : null}
                      </span>
                    </li>
                  ))}
                </ol>
              </article>
            ) : null}

            {training.prerequisites?.length ? (
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="FactCheck" />
                  Prerequisites
                </h2>
                <TagList items={training.prerequisites} />
              </article>
            ) : null}

            {/* Instructor -------------------------------------------------------- */}
            {training.instructorName ? (
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="Person" />
                  Instructor
                </h2>
                <div className="u-cluster">
                  <Avatar name={training.instructorName} src={training.instructorImage} size="lg" ring />
                  <span className="u-stack u-stack--sm">
                    <strong>{training.instructorName}</strong>
                    <span className="u-text-xs u-subtle">
                      {[training.instructorTitle, training.instructorDepartment].filter(Boolean).join(' - ')}
                    </span>
                  </span>
                </div>
                {training.instructorBio ? <p className="u-muted u-text-sm">{training.instructorBio}</p> : null}
              </article>
            ) : null}
          </div>

          {/* Sidebar: schedule, delivery and registration ------------------------ */}
          <aside className="u-stack">
            {training.enableParticipation && me ? (
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="HowToReg" />
                  Registration
                </h2>
                <RegistrationPanel
                  trainingId={training.id}
                  trainingName={training.name}
                  trainingStatus={training.status}
                  enableParticipation={training.enableParticipation}
                  enableCapacity={training.enableCapacity}
                  maxParticipants={training.maxParticipants}
                  registeredCount={registeredCount}
                  enableWaitlist={training.enableWaitlist}
                  myRegistration={myRegistration}
                  me={me}
                />
              </article>
            ) : null}

            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="Event" />
                Schedule &amp; delivery
              </h2>
              <dl className="detail-list">
                <div className="detail-list__row">
                  <dt>Date</dt>
                  <dd>{formatDate(training.date, 'short')}</dd>
                </div>
                {training.startTime || training.endTime ? (
                  <div className="detail-list__row">
                    <dt>Time</dt>
                    <dd>
                      {training.startTime || '--'}
                      {training.endTime ? ` - ${training.endTime}` : ''}
                    </dd>
                  </div>
                ) : null}
                {training.duration ? (
                  <div className="detail-list__row">
                    <dt>Duration</dt>
                    <dd>{training.duration}</dd>
                  </div>
                ) : null}
                <div className="detail-list__row">
                  <dt>Delivery</dt>
                  <dd>{training.deliveryMethod || 'PLACEHOLDER'}</dd>
                </div>
                {training.location ? (
                  <div className="detail-list__row">
                    <dt>Location</dt>
                    <dd>{training.location}</dd>
                  </div>
                ) : null}
                {training.meetingLink ? (
                  <div className="detail-list__row">
                    <dt>Online link</dt>
                    <dd>
                      <a href={training.meetingLink} target="_blank" rel="noreferrer">
                        Join link <Icon name="OpenInNew" fontSize="inherit" />
                      </a>
                    </dd>
                  </div>
                ) : null}
                {training.language ? (
                  <div className="detail-list__row">
                    <dt>Language</dt>
                    <dd>{training.language}</dd>
                  </div>
                ) : null}
              </dl>
            </article>

            {training.targetAudience ? (
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="Groups" />
                  Who this is for
                </h2>
                <p className="u-text-sm u-muted">{training.targetAudience}</p>
              </article>
            ) : null}
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="section section--muted">
          <div className="container-page u-stack u-stack--lg">
            <SectionHeading eyebrow="More like this" eyebrowIcon="MenuBook" title="Related training" as="h2" />
            <div className="grid-auto">
              {related.map((item) => (
                <TrainingCard key={item.id} training={{ ...item, category, type }} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

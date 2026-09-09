import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, TagList } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { EXECUTIVE_ROLES, ROUTES } from '@/lib/constants';

/**
 * Directory card for one colleague.
 *
 * @param {{
 *  employee: import('@/lib/types').Employee,
 *  teamName?: string,
 *  subTeamName?: string,
 *  className?: string,
 * }} props
 */
export function EmployeeCard({ employee, teamName, subTeamName, className = '' }) {
  const isExecutive = EXECUTIVE_ROLES.includes(employee.role);

  return (
    <article className={`employee-card ${isExecutive ? 'employee-card--exec' : ''} ${className}`.trim()}>
      <Link href={ROUTES.employee(employee.id)} className="employee-card__banner" aria-hidden="true" tabIndex={-1} />

      <div className="employee-card__avatar-wrap">
        <Avatar name={employee.fullName} src={employee.photo} size="lg" ring={!isExecutive} ringGold={isExecutive} />
      </div>

      <div className="employee-card__body">
        <h3 className="employee-card__name">
          <Link href={ROUTES.employee(employee.id)}>{employee.fullName}</Link>
        </h3>
        <p className="employee-card__role">{employee.jobTitle}</p>
        <p className="employee-card__team">
          {teamName ?? 'PLACEHOLDER - team'}
          {subTeamName ? ` - ${subTeamName}` : ''}
        </p>

        {isExecutive ? (
          <Badge tone="gold" icon="WorkspacePremium">
            C-Level - {employee.role}
          </Badge>
        ) : null}

        {employee.featured ? (
          <Badge tone="gold" icon="Star">
            Featured
          </Badge>
        ) : null}

        <p className="employee-card__bio">{employee.bio}</p>

        <TagList items={employee.expertise} max={3} className="employee-card__tags" />
      </div>

      <div className="employee-card__footer">
        <span className="card__meta-item" title="Hobbies">
          <Icon name="SportsSoccer" fontSize="inherit" />
          {employee.hobbies?.length ?? 0}
        </span>
        <span className="card__meta-item" title="Initiatives">
          <Icon name="Lightbulb" fontSize="inherit" />
          {employee.initiativeIds?.length ?? 0}
        </span>
        <span className="card__meta-item" title="Awards">
          <Icon name="EmojiEvents" fontSize="inherit" />
          {employee.awards?.length ?? 0}
        </span>
      </div>
    </article>
  );
}

export default EmployeeCard;

"""create certificates table

Revision ID: c01928a4128f
Revises: 7278f0014421
Create Date: 2026-09-28 14:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c01928a4128f'
down_revision: Union[str, None] = '7278f0014421'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'certificates',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('certificate_number', sa.String(length=100), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('course_id', sa.UUID(), nullable=False),
        sa.Column('issue_date', sa.Date(), nullable=False),
        sa.Column('course_start_date', sa.Date(), nullable=True),
        sa.Column('course_end_date', sa.Date(), nullable=True),
        sa.Column('mode', sa.String(length=50), nullable=False, server_default='Online'),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('grade', sa.String(length=20), nullable=True),
        sa.Column('verification_token', sa.String(length=100), nullable=False),
        sa.Column('pdf_url', sa.String(length=500), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='ISSUED'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'course_id', name='uq_user_course_certificate')
    )
    op.create_index(op.f('ix_certificates_certificate_number'), 'certificates', ['certificate_number'], unique=True)
    op.create_index(op.f('ix_certificates_course_id'), 'certificates', ['course_id'], unique=False)
    op.create_index(op.f('ix_certificates_user_id'), 'certificates', ['user_id'], unique=False)
    op.create_index(op.f('ix_certificates_verification_token'), 'certificates', ['verification_token'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_certificates_verification_token'), table_name='certificates')
    op.drop_index(op.f('ix_certificates_user_id'), table_name='certificates')
    op.drop_index(op.f('ix_certificates_course_id'), table_name='certificates')
    op.drop_index(op.f('ix_certificates_certificate_number'), table_name='certificates')
    op.drop_table('certificates')

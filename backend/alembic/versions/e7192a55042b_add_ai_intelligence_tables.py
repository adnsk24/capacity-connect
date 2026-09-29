"""add_ai_intelligence_tables

Revision ID: e7192a55042b
Revises: c01928a4128f
Create Date: 2026-09-29 09:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e7192a55042b'
down_revision: Union[str, Sequence[str], None] = 'c01928a4128f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Extend resources table with AI metadata
    op.add_column('resources', sa.Column('ai_enabled', sa.Boolean(), server_default='true', nullable=False))
    op.add_column('resources', sa.Column('ai_approved', sa.Boolean(), server_default='true', nullable=False))

    # 2. Create ai_document_chunks table
    op.create_table(
        'ai_document_chunks',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('resource_id', sa.UUID(), nullable=False),
        sa.Column('course_id', sa.UUID(), nullable=False),
        sa.Column('module_id', sa.UUID(), nullable=True),
        sa.Column('document_title', sa.String(length=255), nullable=False),
        sa.Column('page_number', sa.Integer(), nullable=True),
        sa.Column('section_name', sa.String(length=255), nullable=True),
        sa.Column('chunk_index', sa.Integer(), server_default='0', nullable=False),
        sa.Column('chunk_text', sa.Text(), nullable=False),
        sa.Column('content_hash', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['module_id'], ['course_modules.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['resource_id'], ['resources.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_ai_document_chunks_resource_id'), 'ai_document_chunks', ['resource_id'], unique=False)
    op.create_index(op.f('ix_ai_document_chunks_course_id'), 'ai_document_chunks', ['course_id'], unique=False)
    op.create_index(op.f('ix_ai_document_chunks_document_title'), 'ai_document_chunks', ['document_title'], unique=False)
    op.create_index(op.f('ix_ai_document_chunks_content_hash'), 'ai_document_chunks', ['content_hash'], unique=False)
    op.create_index('ix_ai_chunks_resource_order', 'ai_document_chunks', ['resource_id', 'chunk_index'], unique=False)

    # 3. Create ai_generated_content table
    op.create_table(
        'ai_generated_content',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('content_type', sa.String(length=50), nullable=False),
        sa.Column('course_id', sa.UUID(), nullable=False),
        sa.Column('module_id', sa.UUID(), nullable=True),
        sa.Column('assessment_id', sa.UUID(), nullable=True),
        sa.Column('created_by', sa.UUID(), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='PENDING_REVIEW', nullable=False),
        sa.Column('reviewed_by', sa.UUID(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('payload', sa.Text(), nullable=False),
        sa.Column('source_citation', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['module_id'], ['course_modules.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_ai_generated_content_content_type'), 'ai_generated_content', ['content_type'], unique=False)
    op.create_index(op.f('ix_ai_generated_content_course_id'), 'ai_generated_content', ['course_id'], unique=False)
    op.create_index(op.f('ix_ai_generated_content_status'), 'ai_generated_content', ['status'], unique=False)

    # 4. Create ai_audit_logs table
    op.create_table(
        'ai_audit_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('feature', sa.String(length=100), nullable=False),
        sa.Column('source_resource_ids', sa.Text(), nullable=True),
        sa.Column('provider', sa.String(length=50), nullable=False),
        sa.Column('model', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('latency_ms', sa.Integer(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_ai_audit_logs_user_id'), 'ai_audit_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_ai_audit_logs_feature'), 'ai_audit_logs', ['feature'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_ai_audit_logs_feature'), table_name='ai_audit_logs')
    op.drop_index(op.f('ix_ai_audit_logs_user_id'), table_name='ai_audit_logs')
    op.drop_table('ai_audit_logs')

    op.drop_index(op.f('ix_ai_generated_content_status'), table_name='ai_generated_content')
    op.drop_index(op.f('ix_ai_generated_content_course_id'), table_name='ai_generated_content')
    op.drop_index(op.f('ix_ai_generated_content_content_type'), table_name='ai_generated_content')
    op.drop_table('ai_generated_content')

    op.drop_index('ix_ai_chunks_resource_order', table_name='ai_document_chunks')
    op.drop_index(op.f('ix_ai_document_chunks_content_hash'), table_name='ai_document_chunks')
    op.drop_index(op.f('ix_ai_document_chunks_document_title'), table_name='ai_document_chunks')
    op.drop_index(op.f('ix_ai_document_chunks_course_id'), table_name='ai_document_chunks')
    op.drop_index(op.f('ix_ai_document_chunks_resource_id'), table_name='ai_document_chunks')
    op.drop_table('ai_document_chunks')

    op.drop_column('resources', 'ai_approved')
    op.drop_column('resources', 'ai_enabled')

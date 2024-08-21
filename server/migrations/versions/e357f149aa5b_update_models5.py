"""update models5

Revision ID: e357f149aa5b
Revises: 1bfe06642406
Create Date: 2024-08-20 16:12:06.370330

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'e357f149aa5b'
down_revision = '1bfe06642406'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('tokens',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('auth_token', sa.String(length=512), nullable=False),
    sa.Column('refresh_token', sa.String(length=512), nullable=False),
    sa.Column('user_spotify_id', sa.String(), nullable=False),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_tokens_user_id_users')),
    sa.PrimaryKeyConstraint('id')
    )
    op.drop_table('spotify_token')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('spotify_token',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('auth_token', sa.VARCHAR(length=512), autoincrement=False, nullable=False),
    sa.Column('refresh_token', sa.VARCHAR(length=512), autoincrement=False, nullable=False),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('user_spotify_id', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('expires_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_spotify_token_user_id_users'),
    sa.PrimaryKeyConstraint('id', name='spotify_token_pkey')
    )
    op.drop_table('tokens')
    # ### end Alembic commands ###

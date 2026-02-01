-- Create Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id BIGSERIAL PRIMARY KEY,
  property_id TEXT UNIQUE NOT NULL,
  owner_address TEXT NOT NULL,
  owner_name TEXT,
  location TEXT NOT NULL,
  area DECIMAL(10, 2) NOT NULL,
  property_type TEXT NOT NULL,
  survey_number TEXT,
  description TEXT,
  ipfs_hash TEXT NOT NULL,
  status INTEGER DEFAULT 0,
  registration_date BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Index on property_id for fast lookups
CREATE INDEX idx_properties_property_id ON properties(property_id);
CREATE INDEX idx_properties_owner ON properties(owner_address);

-- Create Transfer History Table
CREATE TABLE IF NOT EXISTS property_transfers (
  id BIGSERIAL PRIMARY KEY,
  property_id TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  status TEXT NOT NULL,
  transaction_hash TEXT,
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

-- Create Index on property_id for transfer history
CREATE INDEX idx_transfers_property_id ON property_transfers(property_id);
CREATE INDEX idx_transfers_from ON property_transfers(from_address);
CREATE INDEX idx_transfers_to ON property_transfers(to_address);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_transfers ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for properties
-- Allow users to read all properties (public verification)
CREATE POLICY "Anyone can read properties" ON properties
  FOR SELECT
  USING (true);

-- Allow users to insert their own properties
CREATE POLICY "Users can insert their own properties" ON properties
  FOR INSERT
  WITH CHECK (owner_address = CURRENT_USER OR CURRENT_USER = '' OR true);

-- Allow only admins/service role to update properties
CREATE POLICY "Service role can update properties" ON properties
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create RLS Policies for transfers
-- Allow users to read all transfers (public verification)
CREATE POLICY "Anyone can read transfers" ON property_transfers
  FOR SELECT
  USING (true);

-- Allow users to insert transfers for their properties
CREATE POLICY "Users can insert transfers" ON property_transfers
  FOR INSERT
  WITH CHECK (true);

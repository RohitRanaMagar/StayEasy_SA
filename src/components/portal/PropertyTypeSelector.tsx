import { Building2, TreePalm, UtensilsCrossed, BedDouble, Plus } from 'lucide-react'

const PROPERTY_TYPES = [
  { id: 'HOTEL', label: 'Hotel', icon: Building2 },
  { id: 'RESORT', label: 'Resort', icon: TreePalm },
  { id: 'RESTURANT', label: 'Restaurant', icon: UtensilsCrossed },
  { id: 'HOSTEL', label: 'Hostel', icon: BedDouble },
  { id: 'VILLA', label: 'Villa', icon: Building2 },
  { id: 'APARTMENT', label: 'Apartment', icon: Building2 },
  { id: 'GUESTHOUSE', label: 'Guesthouse', icon: BedDouble },
  { id: 'OTHER', label: 'Other', icon: Plus },
]

interface PropertyTypeSelectorProps {
  selectedType: string
  onSelect: (type: string) => void
}

export default function PropertyTypeSelector({ selectedType, onSelect }: PropertyTypeSelectorProps) {
  return (
    <div className="property-type-grid">
      {PROPERTY_TYPES.map((pt) => {
        const Icon = pt.icon
        const isSelected = selectedType === pt.id
        const isCustom = pt.id === 'custom'

        return (
          <button
            key={pt.id}
            className={`property-type-card ${isSelected ? 'selected' : ''} ${isCustom ? 'custom' : ''}`}
            onClick={() => onSelect(pt.id)}
          >
            <div className="property-type-icon">
              <Icon size={28} strokeWidth={1.5} />
            </div>
            <span className="property-type-label">{pt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

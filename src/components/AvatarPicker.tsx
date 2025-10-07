import { motion } from 'framer-motion';
import avatar1 from '@/assets/avatar-1.png';
import avatar2 from '@/assets/avatar-2.png';
import avatar3 from '@/assets/avatar-3.png';
import avatar4 from '@/assets/avatar-4.png';

const avatars = [
  { id: '1', src: avatar1, alt: 'Happy child with brown skin' },
  { id: '2', src: avatar2, alt: 'Cheerful child with glasses' },
  { id: '3', src: avatar3, alt: 'Joyful child with headband' },
  { id: '4', src: avatar4, alt: 'Energetic child in sports jersey' },
];

interface AvatarPickerProps {
  selected: string;
  onSelect: (id: string) => void;
}

export const AvatarPicker = ({ selected, onSelect }: AvatarPickerProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-center">Pick Your Avatar!</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {avatars.map((avatar, index) => (
          <motion.button
            key={avatar.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(avatar.id)}
            className={`
              relative p-4 rounded-2xl transition-all duration-200
              ${selected === avatar.id 
                ? 'ring-4 ring-primary shadow-game-lg scale-105' 
                : 'ring-2 ring-border hover:ring-primary/50 hover-lift'
              }
            `}
          >
            <motion.img
              src={avatar.src}
              alt={avatar.alt}
              className="w-full h-auto rounded-xl"
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            />
            {selected === avatar.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center"
              >
                <span className="text-success-foreground text-xl">✓</span>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

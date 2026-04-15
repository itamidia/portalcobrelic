import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, Target, Users } from 'lucide-react';

export default function QuemSomosModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-[#1e3a5f]">
            <Shield className="w-6 h-6 text-[#d4af37]" />
            Associação Nacional dos Líderes Comunitários
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-gray-700">
          <p>
            A <strong>COBRELIC – Confederação Brasileira das Entidades e Lideranças Comunitárias</strong> é uma entidade independente, sem fins lucrativos, criada com a missão de fortalecer, capacitar e conectar líderes comunitários de todo o Brasil. Atuamos como uma ponte entre as comunidades, o poder público e iniciativas privadas, promovendo projetos, benefícios e soluções que geram impacto social real.
          </p>

          <p>
            Presente em todos os <strong>27 estados brasileiros</strong>, a COBRELIC reúne presidentes estaduais, municipais e milhares de lideranças que dedicam suas vidas a melhorar a qualidade de vida das pessoas ao seu redor. Trabalhamos para profissionalizar a atuação dos líderes, oferecer suporte, treinamento, ferramentas e criar um grande ecossistema de transformação social.
          </p>

          <div className="bg-[#1e3a5f]/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-[#d4af37]" />
              <h3 className="font-bold text-[#1e3a5f] text-lg">Nossa Missão</h3>
            </div>
            <p>
              Promover o desenvolvimento das comunidades brasileiras por meio do fortalecimento das lideranças locais, oferecendo suporte, formação e benefícios que ajudem cada líder a desempenhar sua função com excelência.
            </p>
          </div>

          <div className="bg-[#d4af37]/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-[#1e3a5f]" />
              <h3 className="font-bold text-[#1e3a5f] text-lg">Nossa Visão</h3>
            </div>
            <p>
              Ser a maior e mais influente confederação de lideranças comunitárias do Brasil, reconhecida pela transformação social que promove em cada município do país.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}